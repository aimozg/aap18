/*
 * Created by aimozg on 25.07.2022.
 */
import {BaseAbstractWeapon} from "./BaseAbstractWeapon";
import {MeleeAttackMode} from "./WeaponComponent";

export class BaseMeleeWeapon extends BaseAbstractWeapon {

	constructor(resId: string, name: string, primaryAttack: MeleeAttackMode, ...secondaryAttacks:MeleeAttackMode[]) {
		super(resId, name, primaryAttack, ...secondaryAttacks);
	}


}

