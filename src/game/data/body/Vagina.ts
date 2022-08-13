/*
 * Created by aimozg on 13.08.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {BodyMaterialTypes} from "./Materials";
import {CharacterBody} from "../../../engine/objects/creature/Character";

export abstract class VaginaType extends BodyPartType<VaginaPart> {
	protected constructor(id: string, name: string) {
		super(VaginaRef, id, name);
		this.texts.noun1 = "vagina";
		this.texts.noun2 = "vaginas";
		// TODO properties (wetness/tightness)
		this.texts.descriptionPattern = "{longName}";
	}
	materials = new Set([BodyMaterialTypes.SKIN])
}

export class VaginaPart extends BodyPart<VaginaType> {
	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return VaginaRef; }
	typeNone() { return VaginaTypes.NONE }
	typeHuman() { return VaginaTypes.HUMAN }
}

export const VaginaRef: BodyPartReference<VaginaPart, VaginaType> = new class extends BodyPartReference<VaginaPart, VaginaType> {
	constructor() {super("/vagina");}
	create(body: CharacterBody): VaginaPart {
		return new VaginaPart(body);
	}
}

export namespace VaginaTypes {
	export const NONE = new class extends VaginaType {
		constructor() {
			super("", "none");
			this.texts.noun1 = "no vagina";
			this.texts.noun2 = "no vaginas";
			this.texts.descriptionPattern = "no vagina";
			this.materials.clear();
		}
	}
	export const HUMAN = new class extends VaginaType {
		constructor() {
			super("/human", "human");
			this.texts.type = ["human"];
			this.texts.adj = ["ordinary", "normal"];
		}
	}
}
