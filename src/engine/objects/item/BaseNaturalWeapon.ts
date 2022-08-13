/*
 * Created by aimozg on 24.07.2022.
 */
import {BaseAbstractWeapon} from "./BaseAbstractWeapon";
import {BaseDamageSpec} from "../../rules/Damage";

// TODO @aimozg - I think: keep it singleton and pick damage/type/crit from creature
export class BaseNaturalWeapon extends BaseAbstractWeapon {
	constructor(resId: string, name: string, dmgSpec: BaseDamageSpec) {
		super(resId, name, dmgSpec);
	}
}

