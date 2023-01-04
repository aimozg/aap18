/*
 * Created by aimozg on 27.08.2022.
 */

import Symbols from "../symbols";
import {IResource} from "../IResource";
import {Creature} from "../objects/Creature";
import {PerkRequirementBuilder} from "./perkRequirements";
import {StaticBuffs} from "../objects/creature/stats/BuffableStat";

export interface PerkRequirement {
	name: string;

	test(creature: Creature): boolean;
}

export abstract class PerkType implements IResource {
	readonly resType: symbol = Symbols.ResTypePerk

	protected constructor(
		public readonly resId: string
	) {}

	/* TODO parametrized perks */
	abstract name: string

	abstract description(host: Creature | null): string

	requirements: PerkRequirement[] = [];
	obtainable: boolean = false;

	obtainableBy(creature: Creature): boolean {
		return this.obtainable && !creature.hasPerk(this) && this.requirements.every(r => r.test(creature));
	}

	onAdd(creature: Creature, isLoading: boolean) {}

	onRemove(creature: Creature, isLoading: boolean) {}

	setupRequirements(): PerkRequirementBuilder {
		return new PerkRequirementBuilder(this);
	}
}

export interface SimplePerkOptions {
	id: string,
	name: string,
	description: string,

	requirements?: (b: PerkRequirementBuilder) => void,

	buffs?: StaticBuffs,
	onAdd?: (c: Creature, isLoading: boolean) => void,
	onRemove?: (c: Creature, isLoading: boolean) => void,
}

export class SimplePerkType extends PerkType {
	constructor(public readonly options: SimplePerkOptions,
	) {
		super(options.id);
	}
	public name = this.options.name;

	description(host: Creature | null): string {
		return this.options.description;
	}

	onAdd(creature: Creature, isLoading: boolean) {
		if(this.options.buffs) {
			creature.ctrl.addBuffs(this.options.buffs, this.resId, this.name);
		}
		this.options.onAdd?.(creature, isLoading);
	}

	onRemove(creature: Creature, isLoading: boolean) {
		if (this.options.buffs) {
			creature.ctrl.removeBuffs(this.resId);
		}
	}
}

let preparedRequirements = new Map<PerkType, (b: PerkRequirementBuilder) => void>();

export function createPerk(options: SimplePerkOptions): PerkType {
	let p = new SimplePerkType(options);
	if (options.requirements) preparedRequirements.set(p, options.requirements);
	return p;
}

export function configurePerkRequirements() {
	preparedRequirements.forEach((fn, perk) => {
		fn(perk.setupRequirements());
	});
	preparedRequirements.clear();
}
