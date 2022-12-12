/*
 * Created by aimozg on 11.12.2022.
 */

import {Creature} from "../../Creature";
import {Skill} from "../Skill";
import {TAttribute} from "../../../rules/TAttribute";

/**
 * A wrapper for a particular creature's particular skill
 */
export class CreatureSkill {
	constructor(
		public readonly creature:Creature,
		public readonly skill: Skill
	) {}
	public get name():string { return this.skill.name }
	public get description():string { return this.skill.description }

	public get level():number { return this.creature.skillLevel(this.skill) }
	public get maxNaturalLevel():number { return this.creature.maxNaturalSkill }
	public get isMaxed():boolean { return this.naturalLevel >= this.maxNaturalLevel}

	public get naturalLevel():number { return this.creature.natualSkillLevel(this.skill) }
	public get attr():TAttribute| -1 { return this.skill.attr}
	public get attrBonus():number { return this.attr >= 0 ? this.creature.attrMod(this.attr) : 0 }
	public get miscBonus():number { return this.level - this.naturalLevel - this.attrBonus }

	public get xp():number { return this.creature.skillXp(this.skill) }
	public get nextLevelXp():number { return this.creature.nextSkillLevelXp(this.skill) }
	public get xpProgress():number { return this.isMaxed ? 0 : this.xp/this.nextLevelXp }
}
