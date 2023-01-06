import {AbilityTag, AbilityTargetType, AbstractCombatAbility} from "../../../engine/combat/AbstractCombatAbility";
import {UseAbilityAction} from "../../../engine/combat/actions/UseAbilityAction";
import {CombatController} from "../../../engine/combat/CombatController";
import {ComponentChildren} from "preact";
import {CombatRoll} from "../../../engine/combat/CombatRoll";
import {MeleeAttackAction} from "../../../engine/combat/actions/MeleeAttackAction";

export const PowerAttackAbility = new class extends AbstractCombatAbility {
	name = "Power Attack"
	// group = CombatActionGroups.AGMelee
	targetType = AbilityTargetType.CREATURE
	tags:AbilityTag[] = ["damaging"]
	damageBonus = +3;
	atkBonus = -1;
	energyCostBase = 3;
	description = `${this.energyCostBase} EP. ${this.atkBonus.signed()} Atk, ${this.damageBonus.signed()} Damage.`

	tooltip(action: UseAbilityAction): ComponentChildren {
		return `Use ${this.name} on ${action.targetCreature.name}. ${this.description}`
	}

	energyCost(action: UseAbilityAction): number {
		return this.energyCostBase;
	}

	disabledReason(action: UseAbilityAction, cc: CombatController): string {
		let maa = new MeleeAttackAction(action.actor, action.targetCreature).disabledReason(cc);
		if (maa) return maa;
		return super.disabledReason(action, cc);
	}

	async doEffect(action: UseAbilityAction, cc: CombatController): Promise<void> {
		let {damageBonus,atkBonus} = this;
		await cc.processMeleeRoll(new CombatRoll(
			action.actor,
			action.targetCreature,
			{
				async onStrike(roll) {
					if (roll.damageSpec.length > 0) {
						roll.damageSpec[0].damage = roll.damageSpec[0].damage.withBonus(damageBonus);
						roll.bonus += atkBonus;
					}
				}
			}
		))
	}

}
