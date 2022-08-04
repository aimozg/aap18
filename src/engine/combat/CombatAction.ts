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
	protected abstract checkIsPossible(): boolean
	private _isPossible: boolean|null = null
	isPossible(): boolean {
		this._isPossible ??= this.checkIsPossible()
		return this._isPossible
	}
	abstract label: string
	abstract tooltip: string
}

