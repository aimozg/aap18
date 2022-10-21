/*
 * Created by aimozg on 13.10.2022.
 */

import {CombatAction} from "./CombatAction";
import {Creature} from "../objects/Creature";
import {AbilityTargetType, AbstractCombatAbility} from "./AbstractCombatAbility";
import {CombatController} from "./CombatController";

export class UseAbilityAction extends CombatAction<void>{

	constructor(actor: Creature,
				public ability: AbstractCombatAbility,
	            _target:AbilityTarget|Creature|"self") {
		super(actor);
		let target:AbilityTarget;
		if (_target === "self") {
			target = {type:AbilityTargetType.SELF};
		} else if (_target instanceof Creature) {
			target = {type:AbilityTargetType.CREATURE,creature:_target};
		} else target = _target;
		if (ability.targetType !== target.type) throw new Error(`Ability ${ability.name} incorrectly initialized with target ${target.type}`);
		this.target = target;
		this.label = ability.label(this);
		this.tooltip = ability.tooltip(this);
		this.energyCost = ability.energyCost(this);
		this.apCost = ability.apCost(this);
	}
	protected disabledReason(cc: CombatController): string {
		return this.ability.disabledReason(this);
	}
	readonly label: string;
	readonly target: AbilityTarget;
	readonly tooltip: string;
	readonly energyCost: number;
	readonly apCost: number;
	get targetCreature():Creature {
		switch (this.target.type) {
			case AbilityTargetType.SELF:
				return this.actor
			case AbilityTargetType.CREATURE:
				return this.target.creature
			default:
				throw new Error("Target is not a creature")
		}
	}
	async perform(cc: CombatController): Promise<void> {
		return this.ability.perform(this, cc);
	}
}

export interface AbilityTargetSelf {
	type: AbilityTargetType.SELF
}
export interface AbilityTargetCreature {
	type: AbilityTargetType.CREATURE;
	creature: Creature;
}
export type AbilityTarget = AbilityTargetSelf | AbilityTargetCreature;
