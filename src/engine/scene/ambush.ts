/*
 * Created by aimozg on 26.09.2022.
 */

import {Creature} from "../objects/Creature";
import {ChoiceData, SceneContext} from "./SceneContext";
import {SceneFn} from "./Scene";

export interface EAmbushTags {
	// Target types
	"monster": 1,
	"trap": 1,
	// Target subtypes
	"demon": 1,
	"beast": 1,
	"humanoid": 1,
	// Area types
	"inside": 1,
	"outside": 1,
	// Area subtypes
	"wilderness": 1,
	"forest": 1,
	"desert": 1,
	"building": 1,
	"cave": 1,
	// Other tags
	"scripted": 1
}
export type AmbushTag = keyof EAmbushTags;

export interface AmbushDef {
	/** Difficulty Class. If not present, calculated from monsters and tags */
	dc?: number;
	/** For scripted events with fixed result */
	roll?: number;
	/** Perform check silently, do not print the roll */
	silent?: boolean;
	/** Ambush tags (affect bonuses) */
	tags?: AmbushTag[];
	/** Creatures to be ambushed */
	monsters: Creature[];
	/** Text to display (or scene to play) if ambush roll is failed.  */
	fail: string|SceneFn;
	/** Text to display (or scene to play) if ambush roll is critically failed. */
	critFail: string|SceneFn;
	/** Text to display (or scene to play) if ambush roll is succeeded. */
	success: string|SceneFn;
	// TODO default SuccessOptions
	/** Options given to player if ambush roll succeeds */
	successOptions: ChoiceData[];
}

export type AmbushResultType = 'success'|'fail'|'critFail';

export namespace AmbushRules {

	export function calcAmbushDc(def:AmbushDef) {
		// TODO use monsters, tags, player skill
		return 10;
	}

	export async function doAmbushSuccess(def: AmbushDef, ctx: SceneContext) {
		ctx.choicelist(...def.successOptions);
	}

	export async function doAmbushFail(def: AmbushDef, ctx: SceneContext, critFail: boolean) {
		// TODO if critFail, give monsters a boost
		ctx.endAndBattle(...def.monsters);
	}

	export async function doAmbush(def: AmbushDef, ctx: SceneContext) {
		let roll = def.roll ?? ctx.d20();
		// TODO ambush skill value
		let bonus = 0;
		let dc = def.dc ?? calcAmbushDc(def);
		let diff = roll + bonus - dc;
		let resultType:AmbushResultType;
		let result:string|SceneFn;

		let rollText = def.silent ? "" : `Ambush check ${roll}${bonus.signed()} vs DC ${dc}`
		if (diff >= 0) {
			resultType = "success"
			if (!def.silent) ctx.say(`<p class='text-roll-skill text-roll-success'>\\[${rollText}: Success\\]</p>`)
			result = def.success;
		} else if (diff > -10) {
			resultType = "fail"
			if (!def.silent) ctx.say(`<p class='text-roll-skill text-roll-fail'>\\[${rollText}: Failure\\]</p>`)
			result = def.fail;
		} else {
			resultType = "critFail"
			if (!def.silent) ctx.say(`<p class='text-roll-skill text-roll-critfail'>\\[${rollText}: Critical Failure\\]</p>`)
			result = def.fail;
		}

		if (typeof result === "function") {
			// Override default behaviour
			await result(ctx);
		} else {
			// Print text and apply default result
			ctx.say(result);
			if (resultType === 'success') {
				await doAmbushSuccess(def, ctx)
			} else {
				await doAmbushFail(def, ctx, resultType === 'critFail')
			}
		}
	}

}
