/*
 * Created by aimozg on 14.07.2022.
 */

import {PlayerCharacter} from "../../engine/objects/creature/PlayerCharacter";
import {ChargenRules} from "./chargenData";
import {TAttribute} from "../../engine/rules/TAttribute";

export class ChargenController {

	player: PlayerCharacter;
	ppoints: number;
	spoints: number;

	reset() {
		this.player = new PlayerCharacter();
		this.ppoints = ChargenRules.primaryStatPoints;
		this.spoints = ChargenRules.secondaryStatPoints;
	}

	incPrimaryStat(id:TAttribute) {
		this.player.naturalAttrs[id]++;
	}
	decPrimaryStat(id:TAttribute) {
		this.player.naturalAttrs[id]--;
	}
	primaryStatIncCost(id:TAttribute) {

	}

}
