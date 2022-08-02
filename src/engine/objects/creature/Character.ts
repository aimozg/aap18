/*
 * Created by aimozg on 13.07.2022.
 */
import {Creature} from "../Creature";
import {BodyPart, BodyPartReference} from "./BodyPart";
import {BodyMaterial, BodyMaterialType} from "./BodyMaterial";

export class Character extends Creature {
	readonly objectType: string = "Character";

	hairColor: string = "brown";
	eyeColor: string = "brown";

	body = new CharacterBody(this);

	constructor() {
		super();
		resetToHumanBody(this.body);
	}
}

export class CharacterBody {
	parts: BodyPart<any>[] = BodyPartReference.All.map(ref => ref.create(this));
	materials: BodyMaterial[] = BodyMaterialType.All.map(ref => ref.create(this));
	constructor(public readonly host: Character) {
	}
}

export function resetToHumanBody(body: CharacterBody) {
	for (let bp of body.parts) {
		bp.setType(bp.typeHuman());
	}
}
