/*
 * Created by aimozg on 20.11.2022.
 */

export interface TextIcon {
	text: string;
	fg: string;
	bg: string;
}

export interface CreatureConditionOptions {
	name: string;
	icon: TextIcon;
	combatOnly?: boolean;
}

// TODO put in registry
export class CreatureCondition {
	constructor(
		options: CreatureConditionOptions
	) {
		this.name = options.name;
		this.icon = options.icon;
		this.combatOnly = options?.combatOnly ?? false;
	}
	public readonly name: string;
	public readonly icon: TextIcon;
	public readonly combatOnly: boolean;
}
