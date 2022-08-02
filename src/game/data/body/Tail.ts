/*
 * Created by aimozg on 28.07.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import {BodyMaterialTypes} from "./Materials";

export abstract class TailType extends BodyPartType<TailPart> {
	protected constructor(id: string, name: string) {
		super(TailRef, id, name);
		this.texts.noun1 = "tail"
		this.texts.noun2 = "tails"
	}

	materials = new Set([BodyMaterialTypes.SKIN])
}

export class TailPart extends BodyPart<TailType> {
	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return TailRef }
	typeNone() { return TailTypes.NONE; }
	typeHuman(): TailType { return TailTypes.NONE; }
}

export const TailRef: BodyPartReference<TailPart, TailType> = new class extends BodyPartReference<TailPart, TailType> {
	constructor() {
		super("/tail");
	}
	create(body: CharacterBody): TailPart {
		return new TailPart(body);
	}
};

export namespace TailTypes {
	export const NONE = new class extends TailType {
		constructor() {
			super("", "none");
			this.texts.noun1 = "no tail"
			this.texts.noun2 = "no tails"
			this.texts.descriptionPattern = "no tail";
			this.materials.clear()
		}
	}
	////////
	export const BUNNY = new class extends TailType {
		constructor() {
			super("/bunny", "bunny");
			this.texts.type = ["rabbit", "bunny"];
			this.texts.adj = ["fuzzy", "round", "small"]
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const CAT = new class extends TailType {
		constructor() {
			super("/cat", "cat");
			this.texts.type = ["cat", "feline"];
			this.texts.adj = ["cute", "fuzzy", "furry", "fluffy", "long", "soft"]
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const COW  = new class extends TailType {
		constructor() {
			super("/cow", "cow");
			this.texts.type = ["cow", "bovine"];
			this.texts.adj = ["long", "floppy"]
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const DOG = new class extends TailType {
		constructor() {
			super("/dog", "dog");
			this.texts.type = ["dog", "canine"];
			this.texts.adj = ["fuzzy", "furry", "fluffy", "long", "soft"]
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const FOX = new class extends TailType {
		constructor() {
			super("/fox", "fox");
			this.texts.type = ["fox", "vulpine"];
			this.texts.adj = ["cute", "soft", "fuzzy", "furry", "fluffy", "long"]
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const WOLF = new class extends TailType {
		constructor() {
			super("/wolf", "wolf");
			this.texts.type = ["wolf", "lupine"];
			this.texts.adj = ["soft", "fuzzy", "furry", "fluffy", "long"]
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
}
