/*
 * Created by aimozg on 13.08.2022.
 */
import {BaseItem, BaseItemComponent, registerItemComponent} from "../BaseItem";
import {BaseDamageSpec, DamageType} from "../../rules/Damage";
import {Dice} from "../../math/Dice";
import {IResource} from "../../IResource";
import {Item} from "../Item";

declare module "../BaseItem" {
	export interface BaseItem<out ITEM extends Item> extends IResource {
		weapon: WeaponComponent;
		isWeapon: boolean;
	}
}
declare module "../Item" {
	export interface Item {
		asWeapon: WeaponComponent;
		isWeapon: boolean;
		ifWeapon: Item|null;
	}
}

export class WeaponComponent extends BaseItemComponent {
	constructor(base: BaseItem<any>, public dmgSpec: BaseDamageSpec) {
		super(base);
		if (base.weapon) throw new Error("Cannot add WeaponComponent to "+base);
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


