/*
 * Created by aimozg on 19.09.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import {BodyMaterialType} from "../../../engine/objects/creature/BodyMaterial";

export abstract class CoatType extends BodyPartType<CoatPart> {
	protected constructor(id: string, name: string) {
		super(CoatRef, id, name);
		this.texts.shortName1Pattern = "{color} {noun1}"
		this.texts.descriptionPattern = "{longName}"
		this.texts.fullDescriptionPattern = "[Your] body is covered by {description}."
	}
	materials = new Set<BodyMaterialType>()
	abstract colors(part: CoatPart): string
	protected textReplacer(s: string, part: CoatPart): string {
		if (s === "color") return this.colors(part);
		return super.textReplacer(s, part);
	}
}

export class CoatPart extends BodyPart<CoatType> {

	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return CoatRef }
	typeNone(): CoatType { return CoatTypes.NONE }
	typeHuman(): CoatType { return CoatTypes.NONE }
}

export const CoatRef:BodyPartReference<CoatPart, CoatType> = new class extends BodyPartReference<CoatPart, CoatType> {
	constructor() {super("/coat");}
	create(body: CharacterBody): CoatPart {
		return new CoatPart(body);
	}
}

export namespace CoatTypes {
	export const NONE = new class extends CoatType {
		constructor() {
			super("", "none");
			this.texts.noun1 = "coat"
			this.texts.shortName1Pattern = "no coat"
			this.texts.descriptionPattern = "no coat"
			this.texts.fullDescriptionPattern = "[Your] body is not covered by fur, scales, or any other coat. "
		}
		colors(part: CoatPart): string {
			return "no";
		}
	}
	export const FUR = new class extends CoatType {
		constructor() {
			super("/fur", "fur");
			this.texts.noun1 = "fur";
		}
		colors(part: CoatPart): string {
			return part.body.furColors;
		}
	}
}

