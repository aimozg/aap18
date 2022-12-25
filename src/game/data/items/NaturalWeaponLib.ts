/*
 * Created by aimozg on 24.07.2022.
 */

import {BaseNaturalWeapon} from "../../../engine/objects/item/BaseNaturalWeapon";
import {DamageTypes} from "../../../engine/rules/DamageType";
import {meleeAttackMode} from "../../../engine/objects/item/WeaponComponent";

export namespace NaturalWeaponLib {
	export const NaturalFists = new BaseNaturalWeapon("/nwpn_fists", "fists",
		meleeAttackMode("Punch","punch","1d3", DamageTypes.BLUNT));
}
