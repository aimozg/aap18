import {AbilityTag, AbilityTargetType, AbstractCombatAbility} from "../../../engine/combat/AbstractCombatAbility";
import {UseAbilityAction} from "../../../engine/combat/actions/UseAbilityAction";
import {CombatController} from "../../../engine/combat/CombatController";
import {DamageTypes} from "../../../engine/rules/DamageType";

/** 3 EP, 1d6 fire damage */
export const TinyFireBolt = new class extends AbstractCombatAbility {
    name = "fire bolt"
    targetType = AbilityTargetType.CREATURE
    tags:AbilityTag[] = ["damaging"]

    energyCost(action: UseAbilityAction): number {
        return 3;
    }
    async doEffect(action: UseAbilityAction, cc: CombatController): Promise<void> {
        // TODO combat roll
        cc.logActionVs(action.actor, "shoots a fire bolt to", action.targetCreature, []);
        let damage = cc.rng.d6()
        await cc.doDamage(action.targetCreature, damage, DamageTypes.FIRE, action.actor);
    }
}