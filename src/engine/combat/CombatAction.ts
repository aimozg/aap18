/*
 * Created by aimozg on 02.08.2022.
 */

import {Creature} from "../objects/Creature";
import {CombatController} from "./CombatController";

export abstract class CombatAction<RESULT> {
	protected constructor(
		public readonly actor: Creature
	) {}
	toString():string {
		return "["+Object.getPrototypeOf(this).constructor.name+" "+this.actor.name+"]"
	}

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

