import {BaseItem} from "../BaseItem";
import {Dice} from "../../math/Dice";
import {DamageType} from "../../rules/DamageType";
import {Item} from "../Item";
import {BaseDamageSpec} from "../../rules/BaseDamageSpec";

export abstract class BaseAbstractWeapon<I extends AbstractWeapon> extends BaseItem<I> {
	protected constructor(resId: string,
						  name: string,
	                      public dmgSpec:BaseDamageSpec) {
		super(resId, name);
	}
	get damage(): Dice { return this.dmgSpec.damage }
	get damageType(): DamageType { return this.dmgSpec.damageType }
	get critThreat(): number { return this.dmgSpec.critThreat }
	get critX(): number { return this.dmgSpec.critX }
}

export abstract class AbstractWeapon extends Item {
	protected constructor(public readonly base: BaseAbstractWeapon<any>) {
		super(base);
	}
	get baseDamage(): Dice { return this.base.damage }
	get damageType(): DamageType { return this.base.damageType }
	get critThreat(): number { return this.base.critThreat }
	get critX(): number { return this.base.critX }
}
