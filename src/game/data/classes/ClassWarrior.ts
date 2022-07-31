/*
 * Created by aimozg on 05.07.2022.
 */

import {CharacterClass} from "../../../engine/rules/classes/CharacterClass";

export class ClassWarrior extends CharacterClass {
	readonly resId: string = "warrior";
	description: string =
		"Melee fighter and weapon master." +
		"\n\n" +
		"Subclasses: Duelist, Barbarian, Paladin.";
	isStartingClass: boolean = true;
	name: string = "warrior";
}
