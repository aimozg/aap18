/*
 * Created by aimozg on 10.07.2022.
 */
import {Character} from "./Character";
import {MaxLevel, XpPerLevel} from "../../../game/xp";
import {GDPlayerOrigin} from "../../../game/GameDataBuilder";
import {Game} from "../../Game";
import {Place} from "../../scene/Place";

export class PlayerCharacter extends Character {
	readonly objectType: string = "PlayerCharacter";

	place: Place = Place.Limbo;
	originId: string = "unknown";
	get origin():GDPlayerOrigin { return Game.instance.idata.playerOrigins.find(o=>o.id === this.originId)!}
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
