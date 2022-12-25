/*
 * Created by aimozg on 13.08.2022.
 */
import {BaseItem, BaseItemComponent, registerItemComponent} from "../BaseItem";
import {BaseDamageSpec, DamageType} from "../../rules/Damage";
import {dice, Dice} from "../../math/Dice";

export interface MeleeAttackMode extends BaseDamageSpec {
	name: string;
	verb: string;
	// TODO special attack properties?
}

export function meleeAttackMode(name:string, verb:string, damage: Dice | string, damageType: DamageType): MeleeAttackMode {
	return {
		name,
		verb,
		damage: typeof damage === 'string' ? dice(damage) : damage,
		damageType
	}
}

export class WeaponComponent extends BaseItemComponent {
	constructor(base: BaseItem,
	            public primaryAttack: MeleeAttackMode,
	            public secondaryAttacks: MeleeAttackMode[] = []
	) {
		super(base);
		if (base.weapon) throw new Error("Cannot add WeaponComponent to " + base);
		base.weapon = this;
	}

	attackModes: MeleeAttackMode[] = [this.primaryAttack, ...this.secondaryAttacks];
	hasMode(mode:MeleeAttackMode):boolean {
		return this.primaryAttack === mode || this.secondaryAttacks.includes(mode);
	}
}

registerItemComponent(
	"asWeapon",
	"isWeapon",
	"ifWeapon",
	base => base.weapon);


