/*
 * Created by aimozg on 19.09.2022.
 */

import {CombatController} from "../combat/CombatController";
import {Creature} from "./Creature";
import {CombatAction} from "../combat/CombatAction";
import {MeleeAttackAction} from "../../game/combat/actions/MeleeAttackAction";
import {TeaseAction} from "../../game/combat/actions/TeaseAction";
import {SkipCombatAction} from "../combat/SkipCombatAction";

export abstract class MonsterAI {
	abstract performAI(actor: Creature, cc:CombatController):CombatAction<any>;
}

export class DefaultMonsterAI extends MonsterAI {

	performAI(actor: Creature, cc: CombatController): CombatAction<any> {
		// TODO more complex; check abilities
		let target = cc.party.find(p => p.isAlive)
		let options:CombatAction<any>[] = [];
		if (target) {
			options.push(new MeleeAttackAction(actor, target));
			options.push(new TeaseAction(actor, target));
		}
		if (options.length === 0) options.push(new SkipCombatAction(actor))
		return cc.rng.pick(options);
	}

}

