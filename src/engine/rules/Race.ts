/*
 * Created by aimozg on 14.07.2022.
 */
import {RacialGroup} from "./RacialGroup";

export class Race {
	constructor(
		public readonly group:RacialGroup
	) {}

	isRacialGroup(rg:RacialGroup|string):boolean {
		if (rg instanceof RacialGroup) rg = rg.resId;
		return this.group.resId === rg;
	}
}
