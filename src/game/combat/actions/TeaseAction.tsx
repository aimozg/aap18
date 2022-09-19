import {CombatAction} from "../../../engine/combat/CombatAction";
import {Creature} from "../../../engine/objects/Creature";
import {CombatController} from "../../../engine/combat/CombatController";
import {CombatRules} from "../CombatRules";
import {Fragment} from "preact/compat";
import {h} from "preact";

export interface TeaseResult {
	hit: boolean;
	crit: boolean;
	lust: number;
}

export class TeaseAction extends CombatAction<TeaseResult> {

	constructor(actor: Creature,
	            public readonly target: Creature,
	            public free: boolean = false) {
		super(actor);
	}
	toString(): string {
		return "[TeaseAction "+this.actor.name+" "+this.target.name+" "+(this.free?" (free)":"")+"]"
	}
	protected checkIsPossible(): boolean {
		// TODO impossible if actor has condition, or target is invulnerable/dead
		return true;
	}
	label = "Tease "+this.target.name
	tooltip = "Attempt to seduce "+this.target.name+" with your body"
	async perform(cc: CombatController): Promise<TeaseResult> {
		let attacker = this.actor;
		let target = this.target;
		if (!this.free) {
			// TODO tease AP cost
			await cc.deduceAP(attacker, 1000)
		}
		// TODO animations
		// TODO preference&perversion-based results
		let attack = CombatRules.teaseAttackVs(attacker, target)
		let defense = CombatRules.teaseDefenseVs(target, attacker)
		let toHit = defense - attack
		// TODO charisma
		let attackRoll = cc.rng.d20()
		let damage = CombatRules.teaseDamageVs(attacker, target)
		let canCrit = true
		let critMult = 2
		let result: TeaseResult = {
			hit: false,
			crit: false,
			lust: 0
		}
		if (canCrit && attackRoll === 1) {
			// TODO critical miss effects
			result.crit = true
			cc.logActionVs(attacker,"teases",target,<Fragment><span title={""+attackRoll}>critical miss</span>!</Fragment>)
		} else if (canCrit && attackRoll === 20) {
			// TODO critical hit effects
			result.hit = true
			result.crit = true
			cc.logActionVs(attacker,"teases",target,<Fragment><span title={""+attackRoll}>critical hit</span>!</Fragment>)
		} else if (attackRoll !== 1 && attackRoll >= toHit || attackRoll === 20) {
			cc.logActionVs(attacker, "teases", target, <Fragment><span title={""+attackRoll+attack.signed()+" vs "+defense}>hit</span>.</Fragment>)
			result.hit = true
		} else {
			cc.logActionVs(attacker, "teases", target, <Fragment><span title={""+attackRoll+"+"+attack.signed()+" vs "+defense}>miss</span>.</Fragment>)
		}
		if (result.hit) {
			if (result.crit) damage = CombatRules.repeatPositive(damage, critMult)
			result.lust = damage.roll(cc.rng);
			await cc.doLustDamage(target, result.lust, attacker)
		}
		return result
	}

}