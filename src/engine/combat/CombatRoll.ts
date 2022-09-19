/*
 * Created by aimozg on 14.09.2022.
 */

import {Creature} from "../objects/Creature";
import {Damage, DamageSpec} from "../rules/Damage";
import {CombatController} from "./CombatController";
import {LogManager} from "../logging/LogManager";

export class CombatRoll {
	/**
	 * This action costs AP
	 */
	free: boolean = false;
	/**
	 * This roll was interrupted and should not be processed further
	 */
	cancelled: boolean = false;
	/**
	 * This roll landed a hit on the target
	 */
	hit: boolean = false;
	/**
	 * This roll has hit the target and manifested its effect
	 */
	success: boolean = false;
	/**
	 * This roll can critically hit
	 */
	canCritHit: boolean = true;
	/**
	 * This roll can critically miss
	 */
	canCritMiss: boolean = true;
	/**
	 * Was critical hit
	 */
	critHit: boolean = false;
	/**
	 * Was critical miss
	 */
	critMiss: boolean = false;
	/**
	 * Damage dice to be dealt
	 */
	damageSpec: DamageSpec = [];
	/**
	 * Damage that was dealt (or to be dealt)
	 */
	damage: Damage[] = [];
	/**
	 * AP cost
	 */
	ap: number = 0;
	/**
	 * [roll] + [bonus] vs [dc]
	 */
	roll: number = 0;
	/**
	 * [roll] + [bonus] vs [dc]
	 */
	bonus: number = 0;
	/**
	 * [roll] + [bonus] vs [dc]
	 */
	dc: number = 0;

	onHit: ((roll:CombatRoll, cc:CombatController)=>Promise<void>)|null = null;

	constructor(
		public actor: Creature,
		// TODO target area or group
		public target: Creature
	) {}

	toString():string {
		let s = "CombatRoll["
		s += this.actor.name+" vs "+this.target.name+";"

		if (this.free) s += " free"
		if (this.canCritHit && this.canCritMiss) s += " canCrit"
		else if (this.canCritHit) s += " canCritHit"
		else if (this.canCritMiss) s += " canCritMiss"
		if (this.hit) s += " hit"
		if (this.critHit) s += " critHit"
		if (this.critMiss) s += " critMiss"
		if (this.success) s += " success"

		if (!this.free) s += "; "+this.ap+" AP"
		s += "; "+this.roll+this.bonus.signed()+" vs "+this.dc
		if (this.damage.length > 0) {
			s += "; " + this.damage.map(d => ""+d.damage+" "+d.damageType.name).join(", ")
		} else if (this.damageSpec.length > 0) {
			s += "; " + this.damageSpec.map(d => ""+d.damage+" "+d.damageType.name).join(", ")
		}

		if (this.cancelled) s += "(cancelled)"

		s += "]"
		return s
	}
}

export interface CombatRollProcessor {
	priority: number;
	process(cc:CombatController, roll:CombatRoll):Promise<void>;
}

const logger = LogManager.loggerFor("engine.combat.CombatRoll")

export async function processRoll(cc: CombatController, roll:CombatRoll, queue:CombatRollProcessor[]) {
	logger.debug("processRoll {}", roll)
	for (let p of queue) {
		if (roll.cancelled) break;
		logger.trace("processRoll {} {}", p.priority, roll)
		await p.process(cc, roll)
	}
	logger.debug("processRoll => {}", roll)
	return roll;
}