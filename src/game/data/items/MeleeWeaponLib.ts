/*
 * Created by aimozg on 25.07.2022.
 */

import {BaseMeleeWeapon} from "../../../engine/objects/item/BaseMeleeWeapon";
import {DamageTypes} from "../../../engine/rules/DamageType";
import {baseDmgSpec} from "../../../engine/rules/Damage";

/*
 * Base values (by Liadri):
 *
 * Dice power sequence 1d2, 1d3, 1d4, 1d6, 1d8, 1d10, 2d6, 3d6, 4d6
 * Start with main attack 1d10
 * -1 for special attack totaling +2 dice power
 * -1 for special property
 * +3 if two-handed
 *
 * Examples:
 *
 * Longsword:
 * - 1d8 slashing (3d6 2H)
 * - 1d3 piercing (1d8 2H)
 *
 * Dagger:
 * - 1d6 piercing
 * - Fast (-20% attack AP cost)
 * - Sneaky (can do sneak attack)
 * - Small (attack scales with speed, 1H only)
 */

export namespace MeleeWeaponLib {
	export const Dagger = new BaseMeleeWeapon("/mwpn_dagger", "dagger", baseDmgSpec("1d4", DamageTypes.SLASHING));
}
