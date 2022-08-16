/*
 * Created by aimozg on 13.08.2022.
 */
import {BaseItem, BaseItemComponent, registerItemComponent} from "../BaseItem";
import {BaseDamageSpec, DamageType} from "../../rules/Damage";
import {Dice} from "../../math/Dice";
import {IResource} from "../../IResource";

declare module "../BaseItem" {
	export interface BaseItem extends IResource {
		weapon: WeaponComponent | undefined;
		isWeapon: boolean;
	}
}
declare module "../Item" {
	export interface Item {
		asWeapon: WeaponComponent | undefined;
		isWeapon: boolean;
		ifWeapon: this | null;
	}
}

export class WeaponComponent extends BaseItemComponent {
	constructor(base: BaseItem, public dmgSpec: BaseDamageSpec) {
		super(base);
		if (base.weapon) throw new Error("Cannot add WeaponComponent to " + base);
		base.weapon = this;
	}

	get damage(): Dice { return this.dmgSpec.damage }
	get damageType(): DamageType { return this.dmgSpec.damageType }
}

registerItemComponent(
	"asWeapon",
	"isWeapon",
	"ifWeapon",
	base => base.weapon);


