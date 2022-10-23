/*
 * Created by aimozg on 13.07.2022.
 */
import {Creature} from "../Creature";
import {BodyPart, BodyPartReference} from "./BodyPart";
import {BodyMaterial, BodyMaterialType} from "./BodyMaterial";
import {coerce} from "../../math/utils";
import {TSex} from "../../rules/gender";

export class Character extends Creature {
	readonly objectType: string = "Character";

	body = new CharacterBody(this);
	get sex(): TSex {
		let penis = this.body.penis.isPresent;
		let vagina = this.body.vagina.isPresent;
		if (penis && vagina) return "h";
		if (penis) return "m";
		if (vagina) return "f";
		return "n";
	}
	setSex(sex:TSex) {
		this.body.setSex(sex)
	}

	constructor() {
		super();
		resetToHumanBody(this.body);
	}
}

export class CharacterBody {
	static MinHeightCm = 60
	static MaxHeightCm = 1000

	parts: BodyPart<any>[] = BodyPartReference.All.map(ref => ref.create(this));
	materials: BodyMaterial[] = BodyMaterialType.All.map(ref => ref.create(this));

	private _height: number = 150;
	get height():number { return this._height }
	set height(value:number) {
		this._height = coerce(value, CharacterBody.MinHeightCm, CharacterBody.MaxHeightCm)
	}

	setSex(sex:TSex) {
		// TODO output?
		if (sex === "h" || sex === "m") {
			if (!this.penis.isPresent) this.penis.setType(this.penis.typeHuman());
		} else {
			this.penis.remove();
		}
		if (sex === "h" || sex === "f") {
			if (!this.vagina.isPresent) this.vagina.setType(this.vagina.typeHuman());
		} else {
			this.vagina.remove();
		}
	}

	constructor(public readonly host: Character|null) {
	}

	copyFrom(src:CharacterBody) {
		this._height = src._height;
		for (let i = 0; i < this.parts.length; i++) this.parts[i].copyFrom(src.parts[i]);
		for (let i = 0; i < this.materials.length; i++) this.materials[i].copyFrom(src.materials[i]);
	}
}

export function resetToHumanBody(body: CharacterBody) {
	for (let bp of body.parts) {
		bp.setType(bp.typeHuman());
	}
	body.penis.remove();
	body.vagina.remove();
}
