/*
 * Created by aimozg on 24.07.2022.
 */
import {BaseAbstractWeapon} from "./BaseAbstractWeapon";
import {MeleeAttackMode} from "./WeaponComponent";

// TODO @aimozg - I think: keep it singleton and pick damage/type/crit from creature
export class BaseNaturalWeapon extends BaseAbstractWeapon {
	constructor(resId: string, name: string, primaryAttack: MeleeAttackMode) {
		super(resId, name, primaryAttack);
	}
}

