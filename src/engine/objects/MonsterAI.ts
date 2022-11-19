/*
 * Created by aimozg on 19.09.2022.
 */

import {CombatController} from "../combat/CombatController";
import {Creature} from "./Creature";
import {CombatAction} from "../combat/CombatAction";
import {MeleeAttackAction} from "../combat/actions/MeleeAttackAction";
import {TeaseAction} from "../combat/actions/TeaseAction";
import {SkipCombatAction} from "../combat/actions/SkipCombatAction";
import {UseAbilityAction} from "../combat/actions/UseAbilityAction";
import {AbilityTargetType} from "../combat/AbstractCombatAbility";
import {StepAction} from "../combat/actions/StepAction";
import {Direction} from "../utils/gridutils";

export abstract class MonsterAI {
	constructor(readonly actor:Creature) {}
	abstract choices(cc:CombatController): CombatAction<any>[];
	filterChoices(cc:CombatController, choices:CombatAction<any>[]):CombatAction<any>[] {
		return choices.filter(c => c.isPossible(cc));
	}
	selectAction(cc:CombatController, choices:CombatAction<any>[]):CombatAction<any> {
		if (choices.length === 0) return new SkipCombatAction(this.actor);
		return cc.rng.pick(choices);
	}
	performAI(cc:CombatController):CombatAction<any> {
		let choices = this.choices(cc);
		choices = this.filterChoices(cc, choices);
		return this.selectAction(cc, choices);
	}
}

export class DefaultMonsterAI extends MonsterAI {
	choices(cc: CombatController): CombatAction<any>[] {
		let actor = this.actor;
		// TODO more complex AI
		let target = cc.party.find(p => p.isAlive)
		let options:CombatAction<any>[] = [];

		if (target) {
			if (cc.adjacent(actor, target)) {
				options.push(new MeleeAttackAction(actor, target));
			} else {
				let dir = Direction.to(actor.gobj!, target.gobj!);
				options.push(new StepAction(actor, dir.add(actor.gobj!)));
			}
			options.push(new TeaseAction(actor, target));
		}

		for (let a of actor.abilities) {
			if (a.hasTag("damaging") || a.hasTag("debuff") || a.hasTag("teasing")) {
				if (a.targetType === AbilityTargetType.CREATURE && target) {
					options.push(new UseAbilityAction(actor, a, target));
				}
			} else if (a.hasTag("buff")) {
				// TODO and not already active
			} else if (a.hasTag("healing")) {
				// TODO heal allies?
				// TODO or creature but not other
				if (a.targetType === AbilityTargetType.SELF) {
					if (actor.hpRatio < 0.75) {
						options.push(new UseAbilityAction(actor, a, "self"));
					}
				}
			}
		}

		return options;
	}

}

