import {dice, Dice} from "../math/Dice";
import {DamageType} from "./DamageType";

export interface BaseDamageSpec {
	damage: Dice;
	damageType: DamageType;
	critThreat: number;
	critX: number;
}

export function baseDmgSpec(damage: Dice | string, damageType: DamageType, critThreat: number, critX: number): BaseDamageSpec {
	return {
		damage: typeof damage === 'string' ? dice(damage) : damage,
		damageType,
		critThreat,
		critX
	}
}
