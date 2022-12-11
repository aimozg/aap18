/*
 * Created by aimozg on 21.07.2022.
 */

import {createArray} from "../engine/utils/collections";

export const MaxLevel = 30;
// To get from level N to N+1 you need N*1000 XP
export const XpPerLevel: number[] = createArray(MaxLevel*2, l => (l===MaxLevel) ? Infinity : l * 1000);
export const SkillXpPerLevel: number[] = createArray(MaxLevel * 2, l => (l + 1) * 100);
