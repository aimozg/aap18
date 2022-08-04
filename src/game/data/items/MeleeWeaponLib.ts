/*
 * Created by aimozg on 25.07.2022.
 */

import {BaseMeleeWeapon} from "../../../engine/objects/item/BaseMeleeWeapon";
import {DamageTypes} from "../../../engine/rules/DamageType";
import {baseDmgSpec} from "../../../engine/rules/Damage";

export namespace MeleeWeaponLib {
	export const Dagger = new BaseMeleeWeapon("/mwpn_dagger", "dagger", baseDmgSpec("1d4", DamageTypes.SHARP));
}
