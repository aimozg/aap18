/*
 * Created by aimozg on 26.09.2022.
 */

import {Creature} from "../objects/Creature";
import {ChoiceData, SceneContext} from "./SceneContext";
import {Scene, SceneFn} from "./Scene";
import {substitutePattern} from "../utils/string";
import {CoreSkills} from "../objects/creature/CoreSkills";
import {CombatController} from "../combat/CombatController";

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

	// For default texts&events:

	/** Threat name (ex. "a stray demon") to be used in auto-generated texts*/
	threatName?: string;

	/** If there was a battle, call after it's ended (no matter result) */
	onCombatEnd?: (cc:CombatController)=>Promise<void>;
	/** If there was a battle and player won */
	victory?: Scene|SceneFn;
	/** If there was a battle and player lost */
	defeat?: Scene|SceneFn;

	// For custom texts/events:

	/** Text to display (or scene to play) if ambush roll is failed.  */
	fail?: string|SceneFn;
	/** Text to display (or scene to play) if ambush roll is critically failed. */
	critFail?: string|SceneFn;
	/** Text to display (or scene to play) if ambush roll is succeeded. */
	success?: string|SceneFn;
	// TODO default SuccessOptions
	/** Options given to player if ambush roll succeeds */
	successOptions?: ChoiceData[];
}

export type AmbushResultType = 'success'|'fail'|'critFail';

export interface AmbushResult {
	type: AmbushResultType;
	battle: boolean;
	victory?: boolean;
}

export namespace AmbushRules {

	export function getAreaName(def:AmbushDef, ctx:SceneContext):string {
		// TODO use def tags or ctx player location
		return "wilderness"
	}
	export function getThreatName(def:AmbushDef, ctx:SceneContext):string {
		if (def.threatName !== undefined) {
			return def.threatName;
		}
		if (def.monsters.length === 0) {
			// TODO ctx.error()
			return "<p class='text-error'>ERROR Cannot generate Ambush-Success text for no monsters</p>"
		}
		if (def.monsters.length === 1) {
			return def.monsters[0].name;
		}
		// TODO if monsters have same name, use "<N> <namePlural>" (5 imps)
		// TODO use numberOfThings
		return "" + def.monsters.length + " monsters";
	}

	export function defaultSuccessText(def: AmbushDef, ctx:SceneContext):string {
		return substitutePattern(
			"You notice {threat}, unaware of your presence.", {
				area: getAreaName(def, ctx),
				threat: getThreatName(def, ctx)
			}
		)
	}
	export function defaultFailText(def: AmbushDef, ctx:SceneContext):string {
		return substitutePattern(
			"You encunter {threat}. It's a fight!", {
				area: getAreaName(def, ctx),
				threat: getThreatName(def, ctx)
			}
		)
	}
	export function defaultCritFailText(def: AmbushDef, ctx:SceneContext):string {
		return substitutePattern(
			"Suddenly, a {threat} ambushes you!", {
				area: getAreaName(def, ctx),
				threat: getThreatName(def, ctx)
			}
		)
	}
	export function defaultSuccessOptions(def: AmbushDef, ctx:SceneContext):ChoiceData[] {
		let cd: ChoiceData[] = [];
		let threatName = getThreatName(def, ctx)
		// TODO add talk option if present in def
		/*
		cd.push({
			label: "Talk",
			hint: substitutePattern("Greet {threat} and try to talk")
			call: def.talkScene
		});
		 */
		cd.push({
			label: "Seduce",
			tooltip: substitutePattern("Try to seduce {threat} with your body",{threat:threatName}),
			disabled: { hint: "Not implemented yet "},
			call: (ctx)=>defaultSuccessSeduce(def,ctx)
		});
		cd.push({
			label: "Rape",
			tooltip: substitutePattern("Skip the foreplay and fuck {threat}",{threat:threatName}),
			disabled: { hint: "Not implemented yet "},
			call: (ctx)=>defaultSuccessRape(def,ctx)
		});
		cd.push({
			label: "Sneak Attack",
			tooltip: "Start the combat in sneak mode",
			call: (ctx)=>defaultSuccessSneakAttack(def,ctx)
		});
		cd.push({
			label: "Leave",
			tooltip: substitutePattern("Leave {threat} alone",{threat:threatName}),
			call: (ctx)=>defaultSuccessLeave(def,ctx)
		});
		return cd;
	}
	export async function defaultSuccessSeduce(def: AmbushDef, ctx:SceneContext) {
		throw new Error("defaultSuccessSeduce not implemented")
	}
	export async function defaultSuccessRape(def: AmbushDef, ctx:SceneContext) {
		throw new Error("defaultSuccessRape not implemented")
	}
	export async function defaultSuccessSneakAttack(def: AmbushDef, ctx:SceneContext) {
		ctx.endNowAndBattle({
			enemies: def.monsters,
			ambushed: "enemies",
			then: ctx=>postBattle(def, ctx)
		})
	}
	export async function defaultSuccessLeave(def: AmbushDef, ctx:SceneContext) {
		ctx.endNow()
	}

	export function calcAmbushDc(def:AmbushDef) {
		// TODO use monsters, tags, player skill
		return 15;
	}

	export async function doAmbushSuccess(def: AmbushDef, ctx: SceneContext) {
		let successOptions = def.successOptions ?? defaultSuccessOptions(def, ctx);
		ctx.choicelist(...successOptions);
	}

	export async function doAmbushFail(def: AmbushDef, ctx: SceneContext, critFail: boolean) {
		ctx.endAndBattle({
			enemies:def.monsters,
			ambushed: critFail ? "party" : undefined,
			then: ctx=>postBattle(def, ctx)
		});
	}

	export async function postBattle(def: AmbushDef, ctx:SceneContext) {
		if (ctx.lastBattleVictory) {
			await playScene(ctx, def.victory)
		} else if (ctx.lastBattleDefeat) {
			await playScene(ctx, def.defeat)
		}
		// TODO if retreat
	}

	async function playScene(ctx: SceneContext, scene:Scene|SceneFn|undefined) {
		if (scene) {
			if (scene instanceof Scene) {
				await ctx.play(scene)
			} else {
				await scene(ctx)
			}
		}
		ctx.endNow()
	}

	export async function doAmbush(def: AmbushDef, ctx: SceneContext) {
		let roll = def.roll ?? ctx.d20();
		let bonus = ctx.player.skillValue(CoreSkills.Ambush);
		let dc = def.dc ?? calcAmbushDc(def);
		let diff = roll + bonus - dc;
		let resultType:AmbushResultType;
		let result:string|SceneFn;

		let rollText = def.silent ? "" : `Ambush check ${roll}${bonus.signed()} vs DC ${dc}`
		if (diff >= 0) {
			resultType = "success"
			if (!def.silent) ctx.say(`<p class='text-roll-skill text-roll-success'>\\[${rollText}: Success\\]</p>`)
			result = def.success ?? defaultSuccessText(def, ctx);
		} else if (diff > -10) {
			resultType = "fail"
			if (!def.silent) ctx.say(`<p class='text-roll-skill text-roll-fail'>\\[${rollText}: Failure\\]</p>`)
			result = def.fail ?? defaultFailText(def, ctx);
		} else {
			resultType = "critFail"
			if (!def.silent) ctx.say(`<p class='text-roll-skill text-roll-critfail'>\\[${rollText}: Critical Failure\\]</p>`)
			result = def.critFail ?? def.fail ?? defaultCritFailText(def, ctx);
		}

		if (typeof result === "function") {
			// Override default behaviour
			await result(ctx);
		} else {
			// Print text and apply default result
			if (def.monsters.length > 0) ctx.selectActor(def.monsters[0]);
			ctx.say(result);
			if (def.monsters.length > 0) ctx.deselectActor();
			if (resultType === 'success') {
				await doAmbushSuccess(def, ctx)
			} else {
				await doAmbushFail(def, ctx, resultType === 'critFail')
			}
		}
	}

}
