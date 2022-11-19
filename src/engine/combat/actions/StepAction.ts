/*
 * Created by aimozg on 21.10.2022.
 */

import {CombatAction} from "../CombatAction";
import {Creature} from "../../objects/Creature";
import {CombatController} from "../CombatController";
import {Direction, GridPos} from "../../utils/gridutils";
import {CombatRules} from "../../../game/combat/CombatRules";

export interface StepActionResult {
	success: boolean;
	intercepted: boolean;
}

export class StepAction extends CombatAction<StepActionResult> {

	constructor(actor: Creature,
	            public readonly target: GridPos) {
		super(actor);
		this.direction = Direction.to(actor.gobj!!, target)
		this.label = "Step " + this.direction.name;
		this.tooltip = this.label
	}
	label: string

	get dpadLabel(): string { return "Move"; }
	get dpadClass() { return "dpad-move"}

	tooltip: string
	protected disabledReason(cc: CombatController): string {
		if (!cc.grid.hasxy(this.target.x, this.target.y)) return "Occupied"
		if (!cc.grid.isempty(this.target)) return "Occupied"
		return "";
	}
	async perform(cc: CombatController): Promise<StepActionResult> {
		// TODO ap cost
		let apcost = 500
		apcost *= CombatRules.speedApFactorMove(this.actor.spe);
		await cc.deduceAP(this.actor, apcost);
		// TODO AOO, generic intercept
		// TODO animate movement
		cc.grid.setPos(this.actor.gobj!!, this.target)
		return {success:true,intercepted:false}
	}

}
