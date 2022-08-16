import {BaseItem} from "../BaseItem";
import {BaseDamageSpec} from "../../rules/Damage";
import {WeaponComponent} from "./WeaponComponent";

export abstract class BaseAbstractWeapon extends BaseItem {
	protected constructor(resId: string,
						  name: string,
	                      public dmgSpec:BaseDamageSpec) {
		super(resId, name);
		new WeaponComponent(this, dmgSpec);
	}
}

