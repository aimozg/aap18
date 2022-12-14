import {CombatAction} from "../CombatAction";
import {Creature} from "../../objects/Creature";
import {CommonText} from "../../text/CommonText";
import {CoreSkills} from "../../objects/creature/CoreSkills";
import {CombatActionGroups} from "../CombatActionGroups";
import {CombatController} from "../CombatController";
import {CombatRules} from "../../../game/combat/CombatRules";
import {h} from "preact";
import {CoreConditions} from "../../objects/creature/CoreConditions";
import {SkillCheckResult} from "../../GameController";
import {LevelRules} from "../../rules/LevelRules";

export class SeduceAction extends CombatAction<SkillCheckResult> {

	constructor(actor: Creature,
	            public readonly target: Creature,
	            public free: boolean = false) {
		super(actor);
	}
	toString(): string {
		return `[SeduceAction ${this.actor.name} ${this.target.name}${this.free ? " (free)" : ""}]`
	}
	dc = this.target.ctrl.seductionDC
	bonus = this.actor.skillLevel(CoreSkills.Seduce)
	toHit = this.dc - this.bonus
	label = "Seduce "+this.target.name+" ("+CommonText.skillDcHint(this.toHit)+")"
	group = CombatActionGroups.AGSkills
	tooltip = "Persuade "+this.target.name+" to surrender and have fun."

	protected disabledReason(cc: CombatController): string {
		// TODO if target has seduction immunity
		return "";
	}
	async perform(cc: CombatController): Promise<SkillCheckResult> {
		let {actor,target,dc} = this
		if (!this.free) {
			// TODO seduce AP cost
			let ap = 1000;
			ap *= CombatRules.speedApFactor(actor.spe);
			await cc.deduceAP(actor, ap)
		}
		// TODO animations
		// TODO flavour text
		let result = cc.gc.useSkill({
			actor,
			skill:CoreSkills.Seduce,
			dc,
			xp: LevelRules.SkillXp.LARGE
		})
		if (result.success) {
			// TODO animate successful seduction
			target.setCondition(CoreConditions.Seduced);
		}
		return result
	}

}
