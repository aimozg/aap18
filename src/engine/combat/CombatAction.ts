/*
 * Created by aimozg on 02.08.2022.
 */

import {Creature} from "../objects/Creature";
import {CombatController} from "./CombatController";
import {Direction} from "../utils/gridutils";
import {CombatActionGroups} from "./CombatActionGroups";

export abstract class CombatAction<RESULT> {
	protected constructor(
		public readonly actor: Creature
	) {}
	toString():string {
		return "["+Object.getPrototypeOf(this).constructor.name+" "+this.actor.name+"]"
	}
	/** This action is bound to a particular direction and should be placed on a d-pad in the actions menu */
	public direction:Direction|null = null;
	/** Short label for a d-pad button */
	get dpadLabel():string { return this.label }
	get dpadClass():string { return "" }
	public group:string = CombatActionGroups.AGOther
	public removeStealth = true

	abstract perform(cc: CombatController): Promise<RESULT>
	protected abstract disabledReason(cc: CombatController): string;
	private _disabledReason: string|null = null;
	isPossible(cc: CombatController): boolean {
		this._disabledReason ??= this.disabledReason(cc);
		return !this._disabledReason;
	}
	abstract label: string
	abstract tooltip: string
}

