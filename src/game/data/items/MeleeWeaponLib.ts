/*
 * Created by aimozg on 25.07.2022.
 */

import {BaseMeleeWeapon} from "../../../engine/objects/item/BaseMeleeWeapon";
import {baseDmgSpec} from "../../../engine/rules/BaseDamageSpec";
import {DamageTypes} from "../../../engine/rules/DamageType";

export namespace MeleeWeaponLib {
	export const Dagger = new BaseMeleeWeapon("/mwpn_dagger", "dagger", baseDmgSpec("1d4", DamageTypes.SHARP, 19, 3));
}
