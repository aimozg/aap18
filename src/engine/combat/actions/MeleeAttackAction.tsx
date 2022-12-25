import {Creature} from "../../objects/Creature";
import {CombatController} from "../CombatController";
import {CombatAction} from "../CombatAction";
import {h} from "preact";
import {CombatRoll} from "../CombatRoll";
import {Direction} from "../../utils/gridutils";
import {CombatActionGroups} from "../CombatActionGroups";
import {MeleeAttackMode} from "../../objects/item/WeaponComponent";

export class MeleeAttackAction extends CombatAction<CombatRoll> {
	constructor(
		actor: Creature,
		public readonly target: Creature,
		public free: boolean = false
	) {
		super(actor);
		if (actor.gobj!.grid!.adjacent(actor.gobj!, target.gobj!)) {
			this.direction = Direction.to(actor.gobj!.pos, target.gobj!.pos);
		}
	}

	mode: MeleeAttackMode = this.actor.currentAttackMode
	toString(): string {
		return `[MeleeAttackAction ${this.actor.name} ${this.mode.name} ${this.target.name}${this.free ? " (free)" : ""}]`
	}
	protected disabledReason(cc: CombatController): string {
		// TODO impossible if actor has condition, or target is invulnerable/dead
		// TODO certain melee weapon have longer reach
		if (!cc.adjacent(this.actor, this.target)) return "Too far";
		return "";
	}
	label = this.mode.verb.capitalize() + " " + this.target.name
	group = CombatActionGroups.AGMelee

	get dpadLabel() { return "Strike" }
	get dpadClass() { return "dpad-strike"}

	tooltip = this.mode.verb.capitalize() + " " + this.target.name // TODO details
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
