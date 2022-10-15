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
	protected abstract disabledReason(): string;
	private _disabledReason: string|null = null;
	isPossible(): boolean {
		this._disabledReason ??= this.disabledReason();
		return !this._disabledReason;
	}
	abstract label: string
	abstract tooltip: string
}

