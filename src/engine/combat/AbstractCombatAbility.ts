/*
 * Created by aimozg on 13.10.2022.
 */

import {AbilityTarget, UseAbilityAction} from "./actions/UseAbilityAction";
import {CombatController} from "./CombatController";
import {CombatRules} from "../../game/combat/CombatRules";
import {ComponentChildren} from "preact";
import {Creature} from "../objects/Creature";
import {CombatAction} from "./CombatAction";

export abstract class AbstractCombatAbility {
	abstract readonly name:string;
	abstract readonly targetType:AbilityTargetType;
	abstract readonly tags:AbilityTag[];
	group:string|undefined;
	hasTag(tag:AbilityTag):boolean { return this.tags.includes(tag); }

	guessTargets(actor: Creature, cc: CombatController): Creature[] {
		if (this.hasTag("damaging") || this.hasTag("debuff") || this.hasTag("teasing")) {
			return cc.enemiesOf(actor);
		}
		if (this.hasTag("buff") || this.hasTag("healing")) {
			return cc.alliesOf(actor);
		}
		return cc.participants;
	}
	makeActions(actor:Creature, cc: CombatController): CombatAction<any>[] {
		let result: CombatAction<any>[] = [];
		switch (this.targetType) {
			case AbilityTargetType.SELF:
				result.push(new UseAbilityAction(actor, this, "self"));
				break;
			case AbilityTargetType.CREATURE:
				result.push(...this.guessTargets(actor, cc).map(target=>new UseAbilityAction(actor, this, target)));
				break;
			case AbilityTargetType.AREA:
				// TODO area-targeting abilities
				break;
		}
		return result;
	}

	energyCost(action:UseAbilityAction):number { return 0 }
	apCost(action:UseAbilityAction):number { return 1000*CombatRules.speedApFactor(action.actor.spe) }

	disabledReason(action: UseAbilityAction, cc: CombatController):string {
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
	tooltip(action: UseAbilityAction):ComponentChildren {
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

/** soft enum - TODO document this */
export interface SoftEnumAbilityTags {
	"damaging": 1,
	"healing": 1,
	"teasing": 1,
	"buff": 1,
	"debuff": 1,
}
export type AbilityTag = keyof SoftEnumAbilityTags;
