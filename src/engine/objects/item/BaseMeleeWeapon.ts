/*
 * Created by aimozg on 25.07.2022.
 */
import {BaseAbstractWeapon} from "./BaseAbstractWeapon";
import {BaseDamageSpec} from "../../rules/Damage";

export class BaseMeleeWeapon extends BaseAbstractWeapon {

	constructor(resId: string, name: string, dmgSpec: BaseDamageSpec) {
		super(resId, name, dmgSpec);
	}


}

