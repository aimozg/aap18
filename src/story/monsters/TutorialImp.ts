/*
 * Created by aimozg on 23.07.2022.
 */
import {Character} from "../../engine/objects/creature/Character";
import {RacialGroups} from "../../game/data/racialGroups";

export class TutorialImp extends Character {
	constructor() {
		super();

		this.rgroup = RacialGroups.DEMON;
		this.name = "imp";
		this.sex = "m";
		this.gender = "m";

		this.level = 1;
		this.naturalAttrs = [
			4, 4, 3, 3,
			2, 2, 4, 5
		];
		this.baseHpPerLevel = 5;
		this.baseEpPerLevel = 5;
		this.baseLpMax = 25;

		this.eyeColor = "red";
		// this.body.ears.type = EarTypes.CAT

		this.updateStats();
	}
}
