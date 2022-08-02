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

export abstract class ArmType extends BodyPartType<ArmPart> {
	protected constructor(id: string, name: string) {
		super(ArmsRef, id, name);
		this.count = this.isPresent ? 2 : 0;
	}

	materials = new Set([BodyMaterialTypes.SKIN])
	protected textReplacer(s: string, part: ArmPart): string {
		if (s === 'fingerNoun1') return this.texts.fingerNoun1;
		if (s === 'fingerNoun2') return this.texts.fingerNoun2;
		if (s === 'fingerAdj') return fxrng.pick(this.texts.fingerAdj);
		return super.textReplacer(s, part);
	}
	texts = Object.assign({}, DefaultBodyPartTexts,{
		noun1: "arm",
		noun2: "arms",
		fingerNoun1: "finger",
		fingerNoun2: "fingers",
		fingerAdj: [""],
		descriptionPattern: "{count} {longName} [either with|ending with|and] {fingerAdj} {fingerNoun2}"
	})
}

export class ArmPart extends BodyPart<ArmType> {

	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return ArmsRef; }
	typeNone(): ArmType { return ArmTypes.NONE }
	typeHuman(): ArmType { return ArmTypes.HUMAN }

}

export const ArmsRef: BodyPartReference<ArmPart, ArmType> = new class extends BodyPartReference<ArmPart, ArmType> {
	constructor() {super("/arms");}
	create(body: CharacterBody): ArmPart {
		return new ArmPart(body);
	}
}

export namespace ArmTypes {
	export const NONE = new class extends ArmType {
		constructor() {
			super("", "none");
			this.texts.shortName1Pattern = "no arm"
			this.texts.shortName2Pattern = "no arms"
			this.texts.descriptionPattern = "no arms"
			this.materials.clear()
		}
	}
	export const HUMAN = new class extends ArmType {
		constructor() {
			super("/human", "human");
			this.texts.type = ["human"];
			this.texts.adj = ["ordinary", "normal", "unremarkable"];
			this.texts.fingerAdj = ["ordinary", "normal", "human"];
		}
	}
	////////
	export const BUNNY = new class extends ArmType {
		constructor() {
			super("/bunny", "bunny");
			this.texts.type = ["rabbit", "bunny"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.fingerAdj = ["soft", "padded", "bunny"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const CAT = new class extends ArmType {
		constructor() {
			super("/cat", "cat");
			this.texts.type = ["cat", "feline"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.fingerAdj = ["soft", "padded", "cat"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const DOG = new class extends ArmType {
		constructor() {
			super("/dog", "dog");
			this.texts.type = ["dog", "canine"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.fingerAdj = ["soft", "padded", "dog"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const FOX = new class extends ArmType {
		constructor() {
			super("/fox", "fox");
			this.texts.type = ["fox", "vulpine"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.fingerAdj = ["soft", "padded", "fox"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
	export const WOLF = new class extends ArmType {
		constructor() {
			super("/wolf", "wolf");
			this.texts.type = ["wolf", "lupine"];
			this.texts.adj = ["fuzzy", "furry", "soft"];
			this.texts.fingerAdj = ["soft", "padded", "wolf"];
			this.materials.add(BodyMaterialTypes.FUR)
		}
	}
}

