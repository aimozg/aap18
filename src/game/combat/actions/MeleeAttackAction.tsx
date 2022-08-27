import {Creature} from "../../../engine/objects/Creature";
import {CombatController} from "../../../engine/combat/CombatController";
import {CombatAction} from "../../../engine/combat/CombatAction";
import {Damage} from "../../../engine/rules/Damage";
import {CombatRules} from "../CombatRules";
import {h} from "preact";
import {Fragment} from "preact/compat";

export interface MeleeAttackResult {
	hit: boolean;
	crit: boolean;
	damage: Damage[];
}

export class MeleeAttackAction extends CombatAction<MeleeAttackResult> {
	constructor(
		actor: Creature,
		public readonly target: Creature,
		public free: boolean = false
	) {
		super(actor);
	}

	toString(): string {
		return "[MeleeAttackAction " + this.actor.name + " " + this.target.name + (this.free ? " (free)" : "") + "]"
	}
	protected checkIsPossible(): boolean {
		// TODO impossible if actor has condition, or target is invulnerable/dead
		return true;
	}
	label = "Strike " + this.target.name
	tooltip = "Strike " + this.target.name // TODO details
	async perform(cc: CombatController): Promise<MeleeAttackResult> {
		let attacker = this.actor;
		let target = this.target;
		if (!this.free) {
			// TODO melee attack AP cost
			await cc.deduceAP(attacker, 1000)
		}
		// TODO animations
		// TODO abstract this out!!
		let attack = CombatRules.meleeAttackVs(attacker, target)
		let defense = CombatRules.meleeDefenseVs(target, attacker)
		let toHit = defense - attack
		let attackRoll = cc.rng.d20()
		let damageSpec = CombatRules.meleeDamageVs(attacker, target)
		let canCrit = damageSpec.some(d=>d.canCrit)
		let result: MeleeAttackResult = {
			hit: false,
			crit: false,
			damage: []
		}
		if (canCrit && attackRoll === 1) {
			// TODO critical miss effects
			result.crit = true
			cc.logActionVs(attacker, "attacks", target,
				<Fragment><span title={""+attackRoll}>critical miss</span>!</Fragment>)
		} else if (canCrit && attackRoll === 20) {
			// TODO critical hit effects
			result.hit = true
			result.crit = true
			cc.logActionVs(attacker, "attacks", target, <Fragment><span title={""+attackRoll}>critical hit</span>!</Fragment>)
		} else if (attackRoll !== 1 && attackRoll >= toHit || attackRoll === 20) {
			cc.logActionVs(attacker, "attacks", target, <Fragment><span title={""+attackRoll+attack.signed()+" vs "+defense}>hit</span>.</Fragment>)
			result.hit = true
		} else {
			cc.logActionVs(attacker, "attacks", target, <Fragment><span title={""+attackRoll+"+"+attack.signed()+" vs "+defense}>miss</span>.</Fragment>)
		}
		if (result.hit) {
			result.damage = CombatRules.rollDamage(damageSpec, result.crit, 2)
			await cc.doDamages(target, result.damage, attacker)
		}
		return result
	}
}
