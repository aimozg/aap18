/*
 * Created by aimozg on 21.07.2022.
 */

import {createArray} from "../utils/collections";

export namespace LevelRules {

	// change for testing/cheating
	export let XpGainFactor = 1;

	//----------------//
	// Creature level //
	//----------------//

	export const MaxLevel = 30;
	// To get from level N to N+1 you need N*1000 XP
	export const XpPerLevel: number[] = createArray(MaxLevel*2, l => (l===MaxLevel) ? Infinity : l * 1000);

	//------------------//
	// Levelup benefits //
	//------------------//

	export const SkillPointsGainMin = 1;
	export const SkillPointsGainBase = 1;
	export const SkillPointsGainPerIntMod = 1;

	export const AttrPointsGainEveryNthLevel = 4;
	export const AttrPointsGain = 1;

	export const PerkPointsGainEveryNthLevel = 1;
	export const PerkPointsGain = 1;

	export const ClassUpAtLevels = [1,6,12,18,24,30];

	//-------------//
	// Skill level //
	//-------------//

	// To get from level N to N+1 you need 100+N*10 Skill XP
	export const SkillXpPerLevel: number[] = createArray(MaxLevel * 2, l => 100 + l * 10);

	/**
	 * Amounts of skill XP given. Only if skill succeeds and scaled by DC,
	 * so choose depending on usage frequency, or required resources.
	 */
	export const SkillXp = {
		/** Can use (almost) freely, or every combat turn */
		XSMALL: 2,
		/** Can use often, for combat skills - multiple times per battle.  */
		SMALL: 5,
		/** Average usage frequency and resource cost, for combat skills - can use several times per battle */
		NORMAL: 10,
		/** This skill used not very often (if combat skill - once per battle), or requires precious resources */
		LARGE: 20,
		/** Requires special circumstances/conditions to use, or expensive resources */
		XLARGE: 50,
		XXLARGE: 100,
		XXXLARGE: 200,
	}

	export function calcSkillXpGain(base:number, toHit:number):number {
		if (base <= 0 || toHit <= 1) return 0; // no xp if success was guaranteed
		if (toHit > 20) toHit = 20;
		// factor is x <average rolls to succeed> / 2, so:
		// x0.66 at DC 6 (15/20 chance, avg. 2 successes every 3 rolls)
		// x1 at DC 11 (10/20 chance, avg. 1 success every 2 rolls),
		// x10 at DC 20 (1/20 chance, avg. 1 success every 20 rolls)
		let f = base*10/(21-toHit)+0.499;
		// round up
		return Math.ceil(f);
	}
}

