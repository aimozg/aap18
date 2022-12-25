import {CombatAction} from "../CombatAction";
import {Creature} from "../../objects/Creature";
import {MeleeAttackMode} from "../../objects/item/WeaponComponent";
import {CombatController} from "../CombatController";
import {CombatActionGroups} from "../CombatActionGroups";
import {Fragment, h} from "preact";
import {damageSpan} from "../../text/utils";

export class SelectMeleeAttackModeAction extends CombatAction<void> {

	constructor(actor: Creature, public readonly mode: MeleeAttackMode) {
		super(actor);
	}

	toString(): string {
		return `[SelectMeleeAttackModeAction ${this.actor.name} ${this.mode.name}]`
	}

	protected disabledReason(cc: CombatController): string {
		if (!this.actor.currentWeapon.asWeapon!.hasMode(this.mode)) return `Cannot ${this.mode.name} with ${this.actor.currentWeapon.name}`;
		return ""
	}

	label: string = "Melee: " + this.mode.name + (this.actor.currentAttackMode === this.mode ? " (Active)" : "");
	group = CombatActionGroups.AGModes;
	tooltip = <Fragment>Switch melee attack mode to {this.mode.name} ({damageSpan(this.mode.damage, this.mode.damageType)})</Fragment>
	removeStealth: boolean = false;

	async perform(cc: CombatController): Promise<void> {
		this.actor.preferredAttackMode = this.mode;
	}

}
