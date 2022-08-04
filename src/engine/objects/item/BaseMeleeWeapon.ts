/*
 * Created by aimozg on 25.07.2022.
 */
import {AbstractWeapon, BaseAbstractWeapon} from "./BaseAbstractWeapon";
import {BaseDamageSpec} from "../../rules/Damage";

export class BaseMeleeWeapon extends BaseAbstractWeapon<MeleeWeapon> {

	constructor(resId: string, name: string, dmgSpec: BaseDamageSpec) {
		super(resId, name, dmgSpec);
	}

	spawn(): MeleeWeapon {
		return new MeleeWeapon(this);
	}

}

export class MeleeWeapon extends AbstractWeapon {
	constructor(public readonly base: BaseMeleeWeapon) {
		super(base);
	}
}
