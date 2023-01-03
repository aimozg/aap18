/*
 * Created by aimozg on 27.08.2022.
 */

import Symbols from "../symbols";
import {IResource} from "../IResource";
import {Creature} from "../objects/Creature";
import {PerkRequirementBuilder} from "./perkRequirements";

export interface PerkRequirement {
	name: string;
	test(creature:Creature): boolean;
}

export abstract class PerkType implements IResource {
	readonly resType: symbol = Symbols.ResTypePerk
	protected constructor(
		public readonly resId: string
	) {}
	/* TODO parametrized perks */
	abstract name:string
	abstract description(host:Creature|null):string

	requirements: PerkRequirement[] = [];
	obtainable: boolean = false;
	obtainableBy(creature:Creature):boolean {
		return this.obtainable && !creature.hasPerk(this) && this.requirements.every(r=>r.test(creature));
	}

	setupRequirements():PerkRequirementBuilder {
		return new PerkRequirementBuilder(this);
	}
}

export class SimplePerkType extends PerkType {
	constructor(resId: string, public name:string, public constDescription: string) {
		super(resId);
	}
	description(host: Creature|null): string {
		return this.constDescription;
	}
}
