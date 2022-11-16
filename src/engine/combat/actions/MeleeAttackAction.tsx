import {Creature} from "../../objects/Creature";
import {CombatController} from "../CombatController";
import {CombatAction} from "../CombatAction";
import {h} from "preact";
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
		// TODO certain melee weapon have longer reach
		if (!cc.adjacent(this.actor, this.target)) return "Too far";
		return "";
	}
	label = "Strike " + this.target.name
	tooltip = "Strike " + this.target.name // TODO details
	async perform(cc: CombatController): Promise<CombatRoll> {
		return await cc.processMeleeRoll(new CombatRoll(
			this.actor,
			this.target,
			{
				free: this.free
			})
		);
	}
}
