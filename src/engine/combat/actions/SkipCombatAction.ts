/*
 * Created by aimozg on 27.08.2022.
 */
import {CombatAction} from "../CombatAction";
import {CombatController} from "../CombatController";
import {Creature} from "../../objects/Creature";

export class SkipCombatAction extends CombatAction<void> {

	constructor(actor: Creature) {
		super(actor);
	}
	protected disabledReason(cc: CombatController): string {
		return "";
	}
	label = "Skip";
	tooltip = "Skip your turn"
	async perform(cc: CombatController): Promise<void> {
		cc.logAction(this.actor, "does nothing.", " ");
		await cc.deduceAP(this.actor, this.actor.ap);
		return Promise.resolve(undefined);
	}

}
