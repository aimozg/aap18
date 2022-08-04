import {BaseItem} from "../BaseItem";
import {Dice} from "../../math/Dice";
import {Item} from "../Item";
import {BaseDamageSpec, DamageType} from "../../rules/Damage";

export abstract class BaseAbstractWeapon<I extends AbstractWeapon> extends BaseItem<I> {
	protected constructor(resId: string,
						  name: string,
	                      public dmgSpec:BaseDamageSpec) {
		super(resId, name);
	}
	get damage(): Dice { return this.dmgSpec.damage }
	get damageType(): DamageType { return this.dmgSpec.damageType }
}

export abstract class AbstractWeapon extends Item {
	protected constructor(public readonly base: BaseAbstractWeapon<any>) {
		super(base);
	}
	get baseDamage(): Dice { return this.base.damage }
	get damageType(): DamageType { return this.base.damageType }
}
