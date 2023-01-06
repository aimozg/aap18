/*
 * Created by aimozg on 27.08.2022.
 */
import {CombatAction} from "../CombatAction";
import {CombatController} from "../CombatController";
import {Creature} from "../../objects/Creature";
import {Direction} from "../../utils/gridutils";
import {CombatActionGroups} from "../CombatActionGroups";

export class SkipCombatAction extends CombatAction<void> {

	constructor(actor: Creature) {
		super(actor);
	}

	disabledReason(cc: CombatController): string {
		return "";
	}
	direction = Direction.CENTER;
	label = "Skip";
	get dpadClass() { return "dpad-skip" }
	tooltip = "Skip your turn"
	group = CombatActionGroups.AGMove
	removeStealth = false
	async perform(cc: CombatController): Promise<void> {
		cc.logAction(this.actor, "does nothing.", " ");
		await cc.deduceAP(this.actor, this.actor.ap);
		return Promise.resolve(undefined);
	}

}
