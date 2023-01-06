/*
 * Created by aimozg on 05.07.2022.
 */

import {CharacterClass} from "../../../engine/rules/classes/CharacterClass";
import {createPerk} from "../../../engine/rules/PerkType";
import {PowerAttackAbility} from "../abilities/PowerAttackAbility";

export let ClassWarrior = new class extends CharacterClass {
	readonly resId: string = "warrior";
	description: string =
		"Melee fighter and weapon master." +
		"\n\n" +
		"Subclasses: Duelist, Barbarian, Paladin.";
	isStartingClass: boolean = true;
	name: string = "warrior";
}

export namespace WarriorPerks {
	export let PowerAttack = createPerk({
		id: "/pkwar_powerattack",
		name: "Power Attack",
		description: `(Melee Attack Ability) ${PowerAttackAbility.description}`,
		requirements(b) {
			b.requireLevel(1);
			// TODO b.requireClass(ClassWarrior)
		},
		// TODO add ability:PowerAttackAbility
		onAdd(c) {
			c.abilities.push(PowerAttackAbility)
		},
		onRemove(c) {
			c.abilities.remove(PowerAttackAbility)
		}
	});
}
