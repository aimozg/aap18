/*
 * Created by aimozg on 10.08.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import {BodyMaterialTypes} from "./Materials";

// TODO face part flags: hasMuzzle, isHumanLike

export abstract class FaceType extends BodyPartType<FacePart> {
	protected constructor(id: string, name: string) {
		super(FaceRef, id, name);
		this.texts.noun1 = "face";
		this.texts.noun2 = "faces";
		this.texts.descriptionPattern = "{longName}"
	}
	materials = new Set([BodyMaterialTypes.SKIN])
}

export class FacePart extends BodyPart<FaceType> {
	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return FaceRef }
	typeNone(): FaceType { return FaceTypes.NONE; }
	typeHuman(): FaceType { return FaceTypes.HUMAN; }
}

export const FaceRef:BodyPartReference<FacePart, FaceType> = new class extends BodyPartReference<FacePart, FaceType> {
	constructor() {
		super("/face");
	}
	create(body: CharacterBody): FacePart {
		return new FacePart(body);
	}
}

export namespace FaceTypes {
	export const NONE = new class extends FaceType {
		constructor() {
			super("", "none");
			this.texts.shortName1Pattern = "no face"
			this.texts.shortName2Pattern = "no faces"
			this.texts.descriptionPattern = "no face"
			this.materials.clear()
		}
	}
	export const HUMAN = new class extends FaceType {
		constructor() {
			super("/human", "human");
			this.texts.type = ["human"];
			this.texts.adj = ["ordinary", "normal"];
		}
	}
	////////
	export const BUNNY = new class extends FaceType {
		constructor() {
			super("/bunny", "bunny");
			this.texts.type = ["bunny", "rabbit"];
			this.texts.adj = ["fur-covered", "fuzzy"];
			this.texts.suffix = ["with short muzzle"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const CAT = new class extends FaceType {
		constructor() {
			super("/cat", "cat");
			this.texts.type = ["cat", "feline"];
			this.texts.adj = ["fur-covered", "fuzzy"];
			this.texts.suffix = ["with short muzzle"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const DOG = new class extends FaceType {
		constructor() {
			super("/dog", "dog");
			this.texts.type = ["dog", "canine"];
			this.texts.adj = ["fur-covered", "fuzzy"];
			this.texts.suffix = ["with long muzzle"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const FOX = new class extends FaceType {
		constructor() {
			super("/fox", "fox");
			this.texts.type = ["fox", "vulpine"];
			this.texts.adj = ["fur-covered", "fuzzy"];
			this.texts.suffix = ["with long muzzle"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const WOLF = new class extends FaceType {
		constructor() {
			super("/wolf", "wolf");
			this.texts.type = ["wolf", "lupine"];
			this.texts.adj = ["fur-covered", "fuzzy"];
			this.texts.suffix = ["with long muzzle"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
}
