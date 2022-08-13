/*
 * Created by aimozg on 23.07.2022.
 */

import {BaseItem} from "./BaseItem";

export class Item {
	constructor(
		public readonly base:BaseItem<any>
	) {}

	public customName:string = null;

	public get name():string { return this.customName ?? this.base.name }
}
