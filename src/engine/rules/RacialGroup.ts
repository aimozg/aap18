/*
 * Created by aimozg on 13.07.2022.
 */
import Symbols from "../symbols";
import {IResource} from "../IResource";

export class RacialGroup implements IResource {
	readonly resType: symbol = Symbols.ResTypeRacialGroup;
	constructor(
		public readonly resId: string,
		public name: string
	) {
	}

	static INVALID = new RacialGroup("", "INVALID")
}
