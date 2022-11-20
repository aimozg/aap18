/*
 * Created by aimozg on 20.11.2022.
 */

import {TAttribute} from "../../rules/TAttribute";
import {IResource} from "../../IResource";
import Symbols from "../../symbols";

export interface SkillOptions {
	name: string;
	attr?: TAttribute;
	description: string;
}

export class Skill implements IResource {
	public name: string;
	public attr: TAttribute | -1;
	public description: string;
	resType = Symbols.ResTypeSkill;

	constructor(
		public readonly resId:string,
		options: SkillOptions
	) {
		this.name = options.name;
		this.attr = options.attr ?? -1;
		this.description = options.description;
	}
}
