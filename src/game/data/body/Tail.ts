/*
 * Created by aimozg on 28.07.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {Character} from "../../../engine/objects/creature/Character";

export abstract class TailType extends BodyPartType<TailPart> {
	protected constructor(id: string, name: string) {
		super(TailRef, id, name);
		this.texts.noun1 = "tail"
		this.texts.noun2 = "tails"
	}
}

export class TailPart extends BodyPart<TailType> {
	constructor(host: Character) {
		super(host);
	}

	ref() { return TailRef }
	typeNone() { return TailTypes.NONE; }
	typeHuman(): TailType { return TailTypes.NONE; }
}

export const TailRef: BodyPartReference<TailPart, TailType> = new BodyPartReference<TailPart, TailType>("/tail", host => host.body.tail, host => new TailPart(host));

export namespace TailTypes {
	export const NONE = new class extends TailType {
		constructor() {
			super("", "none");
			this.texts.noun1 = "no tail"
			this.texts.noun2 = "no tails"
		}
	}
	////////
	export const BUNNY = new class extends TailType {
		constructor() {
			super("/bunny", "bunny");
			this.texts.type = ["rabbit", "bunny"];
			this.texts.adj = ["fuzzy", "round", "small"]
		}
	}
	export const CAT = new class extends TailType {
		constructor() {
			super("/cat", "cat");
			this.texts.type = ["cat", "feline"];
			this.texts.adj = ["cute", "fuzzy", "furry", "fluffy", "long", "soft"]
		}
	}
	export const COW  = new class extends TailType {
		constructor() {
			super("/cow", "cow");
			this.texts.type = ["cow", "bovine"];
			this.texts.adj = ["long", "floppy"]
		}
	}
	export const DOG = new class extends TailType {
		constructor() {
			super("/dog", "dog");
			this.texts.type = ["dog", "canine"];
			this.texts.adj = ["fuzzy", "furry", "fluffy", "long", "soft"]
		}
	}
	export const FOX = new class extends TailType {
		constructor() {
			super("/fox", "fox");
			this.texts.type = ["fox", "vulpine"];
			this.texts.adj = ["cute", "soft", "fuzzy", "furry", "fluffy", "long"]
		}
	}
	export const WOLF = new class extends TailType {
		constructor() {
			super("/wolf", "wolf");
			this.texts.type = ["wolf", "lupine"];
			this.texts.adj = ["soft", "fuzzy", "furry", "fluffy", "long"]
		}
	}
}
