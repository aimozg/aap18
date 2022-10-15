/*
 * Created by aimozg on 23.07.2022.
 */
import {Character} from "../../engine/objects/creature/Character";
import {RacialGroups} from "../../game/data/racialGroups";
import {Game} from "../../engine/Game";
import {AbilityTag, AbilityTargetType, AbstractCombatAbility} from "../../engine/combat/AbstractCombatAbility";
import {UseAbilityAction} from "../../engine/combat/UseAbilityAction";
import {CombatController} from "../../engine/combat/CombatController";
import {DamageTypes} from "../../engine/rules/DamageType";

export class TutorialImp extends Character  {

	constructor() {
		super();

		this.rgroup = RacialGroups.DEMON;
		this.name = "imp";

		this.level = 1;
		this.naturalAttrs = [
			4, 4, 3, 3,
			2, 2, 4, 5
		];
		this.baseHpPerLevel = 5;
		this.baseEpPerLevel = 5;
		this.baseLpMax = 25;

		this.body.eyes.color = Game.instance.data.colorByName("red", "eyes");
		this.setSex('m');
		// this.body.ears.type = EarTypes.IMP

		this.abilities.push(new class extends AbstractCombatAbility {
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
		})

		this.updateStats();
	}
}
