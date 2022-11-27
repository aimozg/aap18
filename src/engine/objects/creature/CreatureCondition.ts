/*
 * Created by aimozg on 20.11.2022.
 */

import {IResource} from "../../IResource";
import Symbols from "../../symbols";

export interface TextIcon {
	text: string;
	fg: string;
	bg: string;
}

export interface CreatureConditionOptions {
	name: string;
	description?: string;
	icon: TextIcon;
	combatOnly?: boolean;
}

// TODO put in registry
export class CreatureCondition implements IResource {
	resType = Symbols.ResTypeCondition;

	constructor(
		public readonly resId: string,
		options: CreatureConditionOptions
	) {
		this.name = options.name;
		this.description = options.description ?? "";
		this.icon = options.icon;
		this.combatOnly = options?.combatOnly ?? false;
	}
	public readonly name: string;
	public readonly description: string;
	public readonly icon: TextIcon;
	public readonly combatOnly: boolean;
}
