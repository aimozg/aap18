/*
 * Created by aimozg on 21.07.2022.
 */

import {createArray} from "../engine/utils/collections";

export const MaxLevel = 30;
export const XpPerLevel: number[] = createArray(MaxLevel*2, l => (l===MaxLevel) ? Infinity : l * 1000);
