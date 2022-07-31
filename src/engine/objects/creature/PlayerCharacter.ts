/*
 * Created by aimozg on 10.07.2022.
 */
import {Character} from "./Character";
import {Place} from "../Place";
import {MaxLevel, XpPerLevel} from "../../../game/xp";

export class PlayerCharacter extends Character {
	readonly objectType: string = "PlayerCharacter";

	place: Place = Place.Limbo;
	originId: string = "unknown";
	xp: number = 0;

	////////////
	// Helpers
	////////////
	nextLevelXp(): number {
		if (this.level >= MaxLevel) return Infinity;
		return XpPerLevel[this.level];
	}

	constructor() {super();}
}
