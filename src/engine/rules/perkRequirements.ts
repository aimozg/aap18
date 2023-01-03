/*
 * Created by aimozg on 26.12.2022.
 */

import {PerkRequirement, PerkType} from "./PerkType";
import {Creature} from "../objects/Creature";
import {TAttribute} from "./TAttribute";
import {AttrMetadata} from "../../game/data/stats";

export class PerkRequirementMinLevel implements PerkRequirement {
	constructor(public minLevel: number) {}

	name = `Level ${this.minLevel}`

	test(creature: Creature): boolean {
		return creature.level >= this.minLevel;
	}
}
export class PerkRequirementMinAttribute implements PerkRequirement {
	constructor(public attr:TAttribute, public minValue:number) {}

	name = `${AttrMetadata[this.attr].name} ${this.minValue}+`

	test(creature:Creature):boolean {
		return creature.naturalAttr(this.attr) >= this.minValue;
	}
}
export class PerkRequirementPerk implements PerkRequirement {
	constructor(public otherPerk:PerkType) {}

	name = `${this.otherPerk.name} perk`
	test(creature: Creature): boolean {
		return creature.hasPerk(this.otherPerk);
	}
}
export class PerkRequirementAnyPerk implements PerkRequirement {
	constructor(public otherPerks:PerkType[]) {
		if (otherPerks.length === 0) throw new Error("AnyPerk called with empty list")
	}

	name = `${this.otherPerks.map(p=>p.name).joinToString(', ',' or ')} perk`
	test(creature: Creature): boolean {
		return this.otherPerks.some(p=>creature.hasPerk(p));
	}
}

export class PerkRequirementBuilder {
	constructor(readonly perk: PerkType) {}

	addRequirement(requirement:PerkRequirement):this {
		this.perk.obtainable = true;
		this.perk.requirements.push(requirement);
		return this;
	}

	requireLevel(minLevel:number):this {
		return this.addRequirement(new PerkRequirementMinLevel(minLevel));
	}
	requirePerk(otherPerk: PerkType):this {
		return this.addRequirement(new PerkRequirementPerk(otherPerk));
	}
	requireAnyPerk(...otherPerks: PerkType[]):this {
		return this.addRequirement(new PerkRequirementAnyPerk(otherPerks));
	}
	requireAttr(attr:TAttribute,minValue:number):this{
		return this.addRequirement(new PerkRequirementMinAttribute(attr,minValue));
	}
	requireStr(minStr:number):this {
		return this.requireAttr(TAttribute.STR, minStr);
	}
	requireDex(minDex:number):this {
		return this.requireAttr(TAttribute.DEX, minDex);
	}
	requireCon(minCon:number):this {
		return this.requireAttr(TAttribute.CON, minCon);
	}
	requireSpe(minSpe:number):this {
		return this.requireAttr(TAttribute.SPE, minSpe);
	}
	requirePer(minPer:number):this {
		return this.requireAttr(TAttribute.PER, minPer);
	}
	requireInt(minInt:number):this {
		return this.requireAttr(TAttribute.INT, minInt);
	}
	requireWis(minWis:number):this {
		return this.requireAttr(TAttribute.WIS, minWis);
	}
	requireCha(minCha:number):this {
		return this.requireAttr(TAttribute.CHA, minCha);
	}
}
