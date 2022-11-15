/*
 * Created by aimozg on 10.07.2022.
 */
import {Character} from "./Character";
import {GDPlayerOrigin} from "../../../game/GameDataBuilder";
import {Game} from "../../Game";
import {Place} from "../../place/Place";

export class PlayerCharacter extends Character {
	readonly objectType: string = "PlayerCharacter";

	place: Place = Place.Limbo;
	originId: string = "unknown";
	get origin():GDPlayerOrigin { return Game.instance.idata.playerOrigins.find(o=>o.id === this.originId)!}

	////////////
	// Helpers
	////////////

	constructor() {super();}
}
