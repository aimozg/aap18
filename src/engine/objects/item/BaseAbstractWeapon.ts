import {BaseItem} from "../BaseItem";
import {MeleeAttackMode, WeaponComponent} from "./WeaponComponent";

export abstract class BaseAbstractWeapon extends BaseItem {
	protected constructor(resId: string,
						  name: string,
	                      primaryAttack:MeleeAttackMode,
	                      ...secondaryAttacks:MeleeAttackMode[]) {
		super(resId, name);
		new WeaponComponent(this, primaryAttack, secondaryAttacks);
	}
}

