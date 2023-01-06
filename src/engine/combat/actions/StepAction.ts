/*
 * Created by aimozg on 21.10.2022.
 */

import {CombatAction} from "../CombatAction";
import {Creature} from "../../objects/Creature";
import {AnimationTimeFast, CombatController} from "../CombatController";
import {Direction, GridPos} from "../../utils/gridutils";
import {CombatRules} from "../../../game/combat/CombatRules";
import {CoreConditions} from "../../objects/creature/CoreConditions";
import {CombatActionGroups} from "../CombatActionGroups";

export interface StepActionResult {
	success: boolean;
	intercepted: boolean;
}

export class StepAction extends CombatAction<StepActionResult> {

	constructor(actor: Creature,
	            public readonly target: GridPos) {
		super(actor);
		this.direction = Direction.to(actor.gobj!, target)
		this.label = "Step " + this.direction.name;
		this.tooltip = this.label
	}
	label: string

	get dpadLabel(): string { return "Move"; }
	get dpadClass() { return "dpad-move"}
	group = CombatActionGroups.AGMove
	removeStealth = false

	tooltip: string

	disabledReason(cc: CombatController): string {
		if (!cc.grid.hasxy(this.target.x, this.target.y)) return "Occupied"
		if (!cc.grid.isempty(this.target)) return "Occupied"
		return "";
	}
	async perform(cc: CombatController): Promise<StepActionResult> {
		let actor = this.actor;
		let gobj = actor.gobj!;

		// TODO ap cost
		let apcost = 500
		apcost *= CombatRules.speedApFactorMove(actor.spe);
		await cc.deduceAP(actor, apcost);

		// TODO AOO, generic intercept (combat controller beforeMove)

		let from = gobj.pos;
		cc.grid.setPos(gobj, this.target)
		await cc.grid.animateMovement(gobj, from, this.target, AnimationTimeFast).finished;

		// TODO move to combat controller afterMove
		if (actor.hasCondition(CoreConditions.Stealth)) {
			await cc.doFullStealthCheck(actor);
		}

		return {success:true,intercepted:false}
	}

}
