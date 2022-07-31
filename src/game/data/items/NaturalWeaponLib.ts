/*
 * Created by aimozg on 24.07.2022.
 */

import {BaseNaturalWeapon} from "../../../engine/objects/item/BaseNaturalWeapon";
import {DamageTypes} from "../../../engine/rules/DamageType";
import {baseDmgSpec} from "../../../engine/rules/BaseDamageSpec";

export namespace NaturalWeaponLib {
	export const NaturalFists = new BaseNaturalWeapon("/nwpn_fists", "fists", baseDmgSpec("1d3", DamageTypes.BLUNT, 20, 2));
}
