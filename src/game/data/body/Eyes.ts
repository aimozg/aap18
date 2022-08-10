/*
 * Created by aimozg on 26.07.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import {Color} from "../../../engine/objects/Color";
import {BodyMaterialType} from "../../../engine/objects/creature/BodyMaterial";

export abstract class EyeType extends BodyPartType<EyePart> {

	protected constructor(id: string, name: string) {
		super(EyesRef, id, name);
		this.count = this.isPresent ? 2 : 0;
		this.texts.noun1 = "eye"
		this.texts.noun2 = "eyes"
		this.texts.shortName1Pattern = "{color} {type} {noun1}"
		this.texts.shortName2Pattern = "{color} {type} {noun2}"
	}
	materials = new Set<BodyMaterialType>()
	protected textReplacer(s: string, part: EyePart): string {
		if (s === "color") return part.color.name;
		return super.textReplacer(s, part);
	}
}

export class EyePart extends BodyPart<EyeType> {

	constructor(body: CharacterBody) {
		super(body);
	}
	color:Color = Color.DEFAULT_WHITE
	ref() { return EyesRef }
	typeNone() { return EyeTypes.NONE }
	typeHuman() { return EyeTypes.HUMAN }
	copyFrom(other: EyePart) {
		super.copyFrom(other);
		this.color = other.color;
	}
}

export const EyesRef: BodyPartReference<EyePart, EyeType> = new class extends BodyPartReference<EyePart, EyeType> {
	constructor() {super("/eyes");}
	create(body: CharacterBody): EyePart {
		return new EyePart(body);
	}

}

export namespace EyeTypes {
	export const NONE = new class extends EyeType {
		constructor() {
			super("", "none");
			this.texts.shortName1Pattern = "no eye"
			this.texts.shortName2Pattern = "no eyes"
			this.texts.descriptionPattern = "no eyes"
		}
	}
	export const HUMAN = new class extends EyeType {
		constructor() {
			super("/human", "human");
			this.texts.type = ["human"]
			this.texts.adj = ["ordinary", "normal", "unremarkable"]
		}
	}
	////////
	export const BUNNY = new class extends EyeType {
		constructor() {
			super("/bunny", "bunny");
			this.texts.type = ["rabbit", "bunny"]
		}
	}
	export const CAT = new class extends EyeType {
		constructor() {
			super("/cat", "cat");
			this.texts.type = ["cat", "feline"]
			this.texts.adj = ["beastial", "predatory"]
			this.texts.suffix = ["", "with vertical-slit pupils"]
		}
	}
	export const FOX = new class extends EyeType {
		constructor() {
			super("/fox", "fox");
			this.texts.type = ["fox", "vulpine"]
			this.texts.suffix = ["beasital", "predatory"]
		}
	}
}
