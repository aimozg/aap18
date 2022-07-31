/*
 * Created by aimozg on 24.07.2022.
 */
import {AbstractWeapon, BaseAbstractWeapon} from "./BaseAbstractWeapon";
import {BaseDamageSpec} from "../../rules/BaseDamageSpec";

// TODO @aimozg - I think: keep it singleton and pick damage/type/crit from creature
export class BaseNaturalWeapon extends BaseAbstractWeapon<NaturalWeapon> {
	constructor(resId: string, name: string, dmgSpec: BaseDamageSpec) {
		super(resId, name, dmgSpec);
	}
	spawn(): NaturalWeapon {
		return new NaturalWeapon(this);
	}
}

export class NaturalWeapon extends AbstractWeapon {

	constructor(base: BaseNaturalWeapon) {
		super(base);
	}
}
