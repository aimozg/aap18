/*
 * Created by aimozg on 21.07.2022.
 */

import {createArray} from "../engine/utils/collections";

export const MaxLevel = 30;
// To get from level N to N+1 you need N*1000 XP
export const XpPerLevel: number[] = createArray(MaxLevel*2, l => (l===MaxLevel) ? Infinity : l * 1000);
// To get from level N-1 to N you need N*100 Skill XP
export const SkillXpPerLevel: number[] = createArray(MaxLevel * 2, l => (l + 1) * 10);

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
