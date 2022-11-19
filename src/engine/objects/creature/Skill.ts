/*
 * Created by aimozg on 20.11.2022.
 */

import {TAttribute} from "../../rules/TAttribute";

export interface SkillOptions {
	name: string;
	attr?: TAttribute
}

// TODO put in registry
export class Skill {
	public readonly name: string;
	public readonly attr: TAttribute | -1;
	constructor(
		public readonly id:string,
		options: SkillOptions
	) {
		this.name = options.name;
		this.attr = options.attr ?? -1;
	}
}
