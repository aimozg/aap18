/*
 * Created by aimozg on 07.08.2022.
 */

// TODO somehow should support arm-wings

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import {BodyMaterialType} from "../../../engine/objects/creature/BodyMaterial";

export abstract class WingType extends BodyPartType<WingPart> {
	protected constructor(id: string, name: string) {
		super(WingsRef, id, name);
		this.count = this.isPresent ? 2 : 0;
		this.texts.noun1 = "wing";
		this.texts.noun2 = "wings";
	}
}

export class WingPart extends BodyPart<WingType> {

	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return WingsRef }
	typeNone() { return WingTypes.NONE }
	typeHuman() { return WingTypes.NONE }
}

export const WingsRef: BodyPartReference<WingPart, WingType> = new class extends BodyPartReference<WingPart, WingType> {
	constructor() {super("/wings");}
	create(body: CharacterBody): WingPart {
		return new WingPart(body);
	}
}

export namespace WingTypes {
	export const NONE = new class extends WingType {
		constructor() {
			super("", "none");
			this.texts.shortName1Pattern = "no wing"
			this.texts.shortName2Pattern = "no wings"
			this.texts.descriptionPattern = "no wings"
		}
		materials = new Set<BodyMaterialType>()
	}
}
