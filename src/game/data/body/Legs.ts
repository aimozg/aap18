/*
 * Created by aimozg on 01.08.2022.
 */

import {
	BodyPart,
	BodyPartReference,
	BodyPartType,
	DefaultBodyPartTexts
} from "../../../engine/objects/creature/BodyPart";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import fxrng from "../../../engine/math/fxrng";
import {BodyMaterialTypes} from "./Materials";

// TODO different leg configurations: biped(2), digitrigrade(2) taur(4), drider(8), kraken(8/10), blob(0/1)

export abstract class LegType extends BodyPartType<LegPart> {
	protected constructor(id: string, name: string) {
		super(LegsRef, id, name);
		this.count = this.isPresent ? 2 : 0;
	}

	materials = new Set([BodyMaterialTypes.SKIN])
	protected textReplacer(s: string, part: LegPart): string {
		if (s === 'footNoun') return this.foot(part);
		if (s === 'feetNoun') return this.feet(part);
		if (s === 'footAdj') return fxrng.pick(this.texts.footAdj);
		return super.textReplacer(s, part);
	}
	foot(part:LegPart):string { return this.texts.footNoun }
	feet(part:LegPart):string { return this.texts.feetNoun }
	texts = Object.assign({}, DefaultBodyPartTexts,{
		noun1: "leg",
		noun2: "legs",
		footNoun: "foot",
		feetNoun: "feet",
		footAdj: [""],
		descriptionPattern: "{count} {longName} [either:with|ending with] {footAdj} {feetNoun}"
	})
}

export class LegPart extends BodyPart<LegType> {

	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return LegsRef; }
	typeNone(): LegType { return LegTypes.NONE }
	typeHuman(): LegType { return LegTypes.HUMAN }

	foot(): string { return this.type.foot(this) }
	feet(): string { return this.type.feet(this) }
}

export const LegsRef: BodyPartReference<LegPart, LegType> = new class extends BodyPartReference<LegPart, LegType> {
	constructor() {super("/legs");}
	create(body: CharacterBody): LegPart {
		return new LegPart(body);
	}
}

export namespace LegTypes {
	export const NONE = new class extends LegType {
		constructor() {
			super("", "none");
			this.texts.shortName1Pattern = "no leg"
			this.texts.shortName2Pattern = "no legs"
			this.texts.descriptionPattern = "no legs"
			this.materials.clear()
		}
	}
	export const HUMAN = new class extends LegType {
		constructor() {
			super("/human", "human");
			this.texts.type = ["human"];
			this.texts.adj = ["ordinary", "normal", "unremarkable"];
			this.texts.footAdj = ["ordinary", "normal", "human"];
		}
	}
	////////
	export const BUNNY = new class extends LegType {
		constructor() {
			super("/bunny", "bunny");
			this.texts.type = ["rabbit", "bunny"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.footAdj = ["soft", "padded", "bunny"];
			this.texts.footNoun = "paw";
			this.texts.feetNoun = "paws";
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const CAT = new class extends LegType {
		constructor() {
			super("/cat", "cat");
			this.texts.type = ["cat", "feline"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.footAdj = ["soft", "padded", "cat"];
			this.texts.footNoun = "paw";
			this.texts.feetNoun = "paws";
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const COW = new class extends LegType {
		constructor() {
			super("/cow", "cow");
			this.texts.type = ["cow", "bovine"];
			this.texts.adj = ["furry"];
			this.texts.footAdj = [""];
			this.texts.footNoun = "hoof";
			this.texts.feetNoun = "hooves";
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const DOG = new class extends LegType {
		constructor() {
			super("/dog", "dog");
			this.texts.type = ["dog", "canine"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.footAdj = ["soft", "padded", "dog"];
			this.texts.footNoun = "paw";
			this.texts.feetNoun = "paws";
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const FOX = new class extends LegType {
		constructor() {
			super("/fox", "fox");
			this.texts.type = ["fox", "vulpine"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.footAdj = ["soft", "padded", "fox"];
			this.texts.footNoun = "paw";
			this.texts.feetNoun = "paws";
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const WOLF = new class extends LegType {
		constructor() {
			super("/wolf", "wolf");
			this.texts.type = ["wolf", "lupine"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.footAdj = ["soft", "padded", "wolf"];
			this.texts.footNoun = "paw";
			this.texts.feetNoun = "paws";
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
}

