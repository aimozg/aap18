/*
 * Created by aimozg on 19.09.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {BodyMaterialTypes} from "./Materials";
import {CharacterBody} from "../../../engine/objects/creature/Character";

export abstract class SkinType extends BodyPartType<SkinPart> {
	protected constructor(id: string, name: string) {
		super(SkinRef, id, name);
		this.texts.noun1 = "skin";
		this.texts.shortName1Pattern = "{color} {noun1}"
		this.texts.descriptionPattern = "{longName}"
	}
	materials = new Set([BodyMaterialTypes.SKIN]);
	colors(part: SkinPart): string {
		return part.body.skinColors
	}
	protected textReplacer(s: string, part: SkinPart): string {
		if (s === "color") return this.colors(part);
		return super.textReplacer(s, part);
	}
}

export class SkinPart extends BodyPart<SkinType> {

	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return SkinRef }
	typeNone(): SkinType { return SkinTypes.NONE; }
	typeHuman(): SkinType { return SkinTypes.NORMAL; }
}

export const SkinRef:BodyPartReference<SkinPart, SkinType> = new class extends BodyPartReference<SkinPart, SkinType> {
	constructor() {super("/skin");}
	create(body: CharacterBody): SkinPart {
		return new SkinPart(body);
	}
}

export namespace SkinTypes {
	export const NONE = new class extends SkinType {
		constructor() {
			super("", "none");
			this.materials.clear()
		}
	}
	export const NORMAL = new class extends SkinType {
		constructor() {
			super("/normal", "normal");
		}
	}
}
