import {Creature} from "../../objects/Creature";
import {CombatController} from "../CombatController";
import {CombatAction} from "../CombatAction";
import {h} from "preact";
import {Fragment} from "preact/compat";
import {CombatRoll} from "../CombatRoll";

export class MeleeAttackAction extends CombatAction<CombatRoll> {
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
	protected disabledReason(cc: CombatController): string {
		// TODO impossible if actor has condition, or target is invulnerable/dead
		if (!cc.adjacent(this.actor, this.target)) return "Too far";
		return "";
	}
	label = "Strike " + this.target.name
	tooltip = "Strike " + this.target.name // TODO details
	async perform(cc: CombatController): Promise<CombatRoll> {
		let roll = new CombatRoll(this.actor, this.target);
		roll.free = this.free;
		let attacker = this.actor;
		let target = this.target;
		roll.onHit = async (roll,cc)=>{
			let attackRoll = roll.roll;
			let attack = roll.bonus;
			let defense = roll.dc;
			// TODO animations
			if (roll.critMiss) {
				cc.logActionVs(attacker, "attacks", target,
					<Fragment><span title={""+attackRoll}>critical miss</span>!</Fragment>)
			} else if (roll.critHit) {
				cc.logActionVs(attacker, "attacks", target, <Fragment><span title={""+attackRoll}>critical hit</span>!</Fragment>)
			} else if (roll.hit) {
				cc.logActionVs(attacker, "attacks", target, <Fragment><span title={""+attackRoll+attack.signed()+" vs "+defense}>hit</span>.</Fragment>)
			} else {
				cc.logActionVs(attacker, "attacks", target, <Fragment><span title={""+attackRoll+attack.signed()+" vs "+defense}>miss</span>.</Fragment>)
			}
		}

		await cc.processMeleeRoll(roll);
		return roll
	}
}