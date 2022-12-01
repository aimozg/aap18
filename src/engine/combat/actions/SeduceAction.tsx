import {CombatAction} from "../CombatAction";
import {Creature} from "../../objects/Creature";
import {CommonText} from "../../text/CommonText";
import {CoreSkills} from "../../objects/creature/CoreSkills";
import {CombatActionGroups} from "../CombatActionGroups";
import {CombatController, logref} from "../CombatController";
import {CombatRules} from "../../../game/combat/CombatRules";
import {Fragment, h} from "preact";
import {CoreConditions} from "../../objects/creature/CoreConditions";

export interface SeduceResult {
	success: boolean;
}

export class SeduceAction extends CombatAction<SeduceResult> {

	constructor(actor: Creature,
	            public readonly target: Creature,
	            public free: boolean = false) {
		super(actor);
	}
	toString(): string {
		return `[SeduceAction ${this.actor.name} ${this.target.name}${this.free ? " (free)" : ""}]`
	}
	dc = this.target.ctrl.seductionDC
	bonus = this.actor.skillValue(CoreSkills.Seduce)
	toHit = this.dc - this.bonus
	label = "Seduce "+this.target.name+" ("+CommonText.skillDcHint(this.toHit)+")"
	group = CombatActionGroups.AGSkills
	tooltip = "Attempt to make "+this.target.name+" give up to their lust"

	protected disabledReason(cc: CombatController): string {
		// TODO if target has seduction immunity
		return "";
	}
	async perform(cc: CombatController): Promise<SeduceResult> {
		let {actor,target,dc,bonus,toHit} = this
		if (!this.free) {
			// TODO seduce AP cost
			let ap = 1000;
			ap *= CombatRules.speedApFactor(actor.spe);
			await cc.deduceAP(actor, ap)
		}
		// TODO animations
		let roll = cc.rng.d20()
		let successIsGood = cc.party.includes(actor);
		let success = roll >= toHit;
		cc.logSkillCheck(roll,bonus,dc,successIsGood, <Fragment>{logref(actor)} Seduce {logref(target)}</Fragment>);
		if (success) {
			// TODO animate successful seduction
			target.setCondition(CoreConditions.Seduced);
		}
		return { success: success }
	}

}
