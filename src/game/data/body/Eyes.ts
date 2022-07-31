/*
 * Created by aimozg on 26.07.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {Character} from "../../../engine/objects/creature/Character";
import fxrng from "../../../engine/math/fxrng";
import {Color} from "../../../engine/objects/Color";

export abstract class EyeType extends BodyPartType<EyePart> {

	protected constructor(id: string, name: string) {
		super(EyesRef, id, name);
		this.count = this.isPresent ? 2 : 0;
		this.texts.noun1 = "eye"
		this.texts.noun2 = "eyes"
		this.texts.shortName1Pattern = "{color} {type} {noun1}"
		this.texts.shortName2Pattern = "{color} {type} {noun2}"
	}
	protected textReplacer(s: string, part: EyePart): string {
		if (s === "color") return part.color.name;
		return super.textReplacer(s, part);
	}

	description = (part: EyePart) => fxrng.either("a pair of ", "two ") + this.longName2(part)
}

export class EyePart extends BodyPart<EyeType> {

	constructor(host: Character) {
		super(host);
	}

	color:Color = Color.DEFAULT_WHITE
	ref() { return EyesRef }
	typeNone() { return EyeTypes.NONE }
	typeHuman() { return EyeTypes.HUMAN }
}

export const EyesRef: BodyPartReference<EyePart, EyeType> = new BodyPartReference<EyePart, EyeType>("/eyes", host => host.body.eyes, host => new EyePart(host))

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
