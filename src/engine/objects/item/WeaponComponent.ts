/*
 * Created by aimozg on 13.08.2022.
 */
import {BaseItem, BaseItemComponent, registerItemComponent} from "../BaseItem";
import {BaseDamageSpec, DamageType} from "../../rules/Damage";
import {Dice} from "../../math/Dice";

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


