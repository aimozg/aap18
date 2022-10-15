/*
 * Created by aimozg on 13.10.2022.
 */

import {AbilityTarget, UseAbilityAction} from "./UseAbilityAction";
import {CombatController} from "./CombatController";

export abstract class AbstractCombatAbility {
	abstract readonly name:string;
	abstract readonly targetType:AbilityTargetType;
	abstract readonly tags:AbilityTag[];
	hasTag(tag:AbilityTag):boolean { return this.tags.includes(tag); }

	energyCost(action:UseAbilityAction):number { return 0 }
	apCost(action:UseAbilityAction):number { return 1000 }
	disabledReason(action: UseAbilityAction):string {
		if (action.energyCost > action.actor.ep) return "Not enough energy";
		return ""
	}
	protected abstract doEffect(action: UseAbilityAction, cc:CombatController): Promise<void>;
	protected async useResources(action: UseAbilityAction, cc:CombatController): Promise<void> {
		await Promise.all([
			(action.apCost === 0) ? Promise.resolve() : cc.deduceAP(action.actor, action.apCost),
			(action.energyCost === 0) ? Promise.resolve() : cc.deduceEP(action.actor, action.energyCost),
		]);
	}
	async perform(action: UseAbilityAction, cc:CombatController): Promise<void> {
		await this.useResources(action, cc);
		await this.doEffect(action, cc);
	}
	label(action: UseAbilityAction):string {
		switch (action.target.type) {
			case AbilityTargetType.SELF:
				return `${this.name} (Self)`;
			case AbilityTargetType.CREATURE:
				return `${this.name} (${action.target.creature.name})`;
			default:
				return `ERROR bad action target type ${(action.target as AbilityTarget).type}`
		}
	}
	tooltip(action: UseAbilityAction):string {
		switch (action.target.type) {
			case AbilityTargetType.SELF:
				return `Use ${this.name} on self`;
			case AbilityTargetType.CREATURE:
				return `Use ${this.name} on ${action.target.creature.name}`;
			default:
				return `ERROR bad action target type ${(action.target as AbilityTarget).type}`
		}
	}
}

// TODO move SELF to AbilityTargetFilter ("self", "other", "ally", "enemy")
export enum AbilityTargetType {
	SELF,
	CREATURE,
	AREA
}

/** soft enum */
export interface SEAbilityTags {
	"damaging": 1,
	"healing": 1,
	"teasing": 1,
	"buff": 1,
	"debuff": 1,
}
export type AbilityTag = keyof SEAbilityTags;
