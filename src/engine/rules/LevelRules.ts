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

	// To get from level N-1 to N you need N*100 Skill XP
	export const SkillXpPerLevel: number[] = createArray(MaxLevel * 2, l => (l + 1) * 100);

	/**
	 * Amounts of skill XP given on success.
	 */
	export const SkillXp = {
		XSMALL: 2,
		SMALL: 5,
		NORMAL: 10,
		LARGE: 20,
		XLARGE: 40
	}
}

