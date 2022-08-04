import {dice, Dice} from "../math/Dice";

/*
 * Created by aimozg on 24.07.2022.
 */
export class DamageType {
	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly cssSuffix: string
	) {}
}

export interface DamageSpecEntry {
	damage: Dice;
	damageType: DamageType;
	canCrit: boolean;
}

export type DamageSpec = DamageSpecEntry[]

export interface Damage {
	damage:number;
	damageType:DamageType
}

export interface BaseDamageSpec {
	damage: Dice;
	damageType: DamageType;
}

export function baseDmgSpec(damage: Dice | string, damageType: DamageType): BaseDamageSpec {
	return {
		damage: typeof damage === 'string' ? dice(damage) : damage,
		damageType,
	}
}
