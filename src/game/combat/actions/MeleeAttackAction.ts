import {Creature} from "../../../engine/objects/Creature";
import {CombatController} from "../../../engine/combat/CombatController";
import {CombatAction} from "../../../engine/combat/CombatAction";
import {Damage} from "../../../engine/rules/Damage";
import {CombatRules} from "../CombatRules";

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
		return true;
	}
	label = "Strike " + this.target.name
	tooltip = "Strike " + this.target.name // TODO details
	async perform(cc: CombatController): Promise<MeleeAttackResult> {
		// TODO melee attack AP cost
		let attacker = this.actor;
		let target = this.target;
		if (!this.free) {
			await cc.deduceAP(attacker, 1000)
		}
		// TODO animations
		// TODO abstract this out!!
		let attack = CombatRules.meleeAttackVs(attacker, target)
		let defense = CombatRules.meleeDefenseVs(target, attacker)
		let toHit = defense - attack
		let attackRoll = cc.rng.d20()
		// TODO affected by STR
		let damageSpec = CombatRules.meleeDamageVs(attacker, target)
		let canCrit = damageSpec.some(d=>d.canCrit)
		let result: MeleeAttackResult = {
			hit: false,
			crit: false,
			damage: []
		}
		if (attackRoll === 1) {
			// TODO critical miss effects
			result.crit = true
			cc.logActionVs(attacker, "attacks", target, "critical miss.")
		} else if (canCrit && attackRoll === 20) {
			// TODO critical hit effects
			result.hit = true
			result.crit = true
			cc.logActionVs(attacker, "attacks", target, "critical hit.")
		} else if (attackRoll >= toHit || attackRoll === 20) {
			cc.logActionVs(attacker, "attacks", target, "hit.")
			result.hit = true
		} else {
			cc.logActionVs(attacker, "attacks", target, "miss.")
		}
		if (result.hit) {
			result.damage = CombatRules.rollDamage(damageSpec, result.crit, 2)
			await cc.doDamages(target, result.damage, attacker)
		}
		return result
	}
}
