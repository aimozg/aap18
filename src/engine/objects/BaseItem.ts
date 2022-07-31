/*
 * Created by aimozg on 23.07.2022.
 */

import {IResource} from "../IResource";
import Symbols from "../symbols";
import {Item} from "./Item";

export abstract class BaseItem<out I extends Item> implements IResource {
	get resType() { return Symbols.ResTypeBaseItem }
	protected constructor(
		public readonly resId:string,
		public name: string) { }

	abstract spawn():I
}

