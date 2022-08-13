import {BaseItem} from "../BaseItem";
import {Item} from "../Item";
import {BaseDamageSpec} from "../../rules/Damage";
import {WeaponComponent} from "./WeaponComponent";

export abstract class BaseAbstractWeapon extends BaseItem<Item> {
	protected constructor(resId: string,
						  name: string,
	                      public dmgSpec:BaseDamageSpec) {
		super(resId, name);
		new WeaponComponent(this, dmgSpec);
	}
	spawn(): Item {
		return new Item(this);
	}
}

export abstract class AbstractWeapon extends Item {
	protected constructor(public readonly base: BaseAbstractWeapon) {
		super(base);
	}
}
