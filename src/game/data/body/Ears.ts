/*
 * Created by aimozg on 22.07.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {Character} from "../../../engine/objects/creature/Character";
import fxrng from "../../../engine/math/fxrng";

export abstract class EarType extends BodyPartType<EarPart> {
	protected constructor(id: string, name: string) {
		super(EarsRef, id, name);
		this.count = this.isPresent ? 2 : 0;
		this.texts.noun1 = "ear"
		this.texts.noun2 = "ears"
	}

	description = (part: EarPart) => fxrng.either("a pair of ", "two ") + this.longName2(part)
}

export class EarPart extends BodyPart<EarType> {
	constructor(host: Character) {
		super(host);
	}

	ref() { return EarsRef }
	typeNone() { return EarTypes.NONE; }
	typeHuman() { return EarTypes.HUMAN; }
}

export const EarsRef = new BodyPartReference<EarPart, EarType>("/ears", host => host.body.ears, host => new EarPart(host));

export namespace EarTypes {
	export const NONE = new class extends EarType {
		constructor() {
			super("", "none")
			this.texts.noun1 = "no ear"
			this.texts.noun2 = "no ears"
		}
		description = () => "no ears"
	}
	export const HUMAN = new class extends EarType {
		constructor() {
			super("/human", "human")
			this.texts.type = ["human"]
			this.texts.adj = ["ordinary", "normal", "unremarkable"]
		}
	}
	////////
	export const BUNNY = new class extends EarType {
		constructor() {
			super("/bunny", "bunny")
			this.texts.type = ["rabbit", "bunny"]
			this.texts.adj = ["floppy", "long", "fuzzy", "furry", "long floppy", "long fuzzy"]
		}
	}
	export const CAT = new class extends EarType {
		constructor() {
			super("/cat", "cat")
			this.texts.type = ["cat", "feline"]
			this.texts.adj = ["cute", "soft", "small", "fuzzy", "furry", "cute fuzzy"]
		}
	}
	export const COW = new class extends EarType {
		constructor() {
			super("/cow", "cow")
			this.texts.type = ["cow", "bovine"]
			this.texts.adj = ["fuzzy", "floppy"]
		}
	}
	export const DOG = new class extends EarType {
		constructor() {
			super("/cat", "cat")
			this.texts.type = ["dog", "canine"]
			this.texts.adj = ["fuzzy", "soft", "furry", "floppy"]
		}
	}
	export const FOX = new class extends EarType {
		constructor() {
			super("/fox", "fox")
			this.texts.type = ["fox", "vulpine"]
			this.texts.adj = ["cute", "soft", "fuzzy", "fluffy", "perky", "pointy"]
		}
	}
	export const WOLF = new class extends EarType {
		constructor() {
			super("/wolf", "wolf")
			this.texts.type = ["wolf", "lupine"]
			this.texts.adj = ["fuzzy", "soft", "furry", "pointy"]
		}
	}
}
