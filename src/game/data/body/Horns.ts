/*
 * Created by aimozg on 10.08.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import {BodyMaterialType} from "../../../engine/objects/creature/BodyMaterial";

// TODO color/keratin material
// TODO sizes

export abstract class HornType extends BodyPartType<HornPart> {
	protected constructor(id: string, name: string) {
		super(HornsRef, id, name);
		this.count = this.isPresent ? 2 : 0;
		this.texts.noun1 = "horn";
		this.texts.noun2 = "horns";
	}
	materials = new Set<BodyMaterialType>()
}

export class HornPart extends BodyPart<HornType> {

	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return HornsRef }
	typeNone() { return HornTypes.NONE }
	typeHuman() { return HornTypes.NONE}
}

export const HornsRef: BodyPartReference<HornPart, HornType> = new class extends BodyPartReference<HornPart, HornType> {
	constructor() {
		super("/horns");
	}
	create(body: CharacterBody): HornPart {
		return new HornPart(body);
	}
}

export namespace HornTypes {
	export const NONE = new class extends HornType {
		constructor() {
			super("", "none");
			this.texts.shortName1Pattern = "no horn"
			this.texts.shortName2Pattern = "no horns"
			this.texts.descriptionPattern = "no horns"
		}
	}
	////////
	export const COW = new class extends HornType {
		constructor() {
			super("/cow", "cow");
			// TODO distinction by gender? [mf:bull|cow]
			this.texts.type = ["cow", "bovine"]
			// TODO adjs
		}
	}
}
