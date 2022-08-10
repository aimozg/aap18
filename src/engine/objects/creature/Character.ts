/*
 * Created by aimozg on 13.07.2022.
 */
import {Creature} from "../Creature";
import {BodyPart, BodyPartReference} from "./BodyPart";
import {BodyMaterial, BodyMaterialType} from "./BodyMaterial";
import {coerce} from "../../math/utils";

export class Character extends Creature {
	readonly objectType: string = "Character";

	body = new CharacterBody(this);

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

	constructor(public readonly host: Character|null) {
	}

	copyFrom(src:CharacterBody) {
		for (let i = 0; i < this.parts.length; i++) this.parts[i].copyFrom(src.parts[i]);
		for (let i = 0; i < this.materials.length; i++) this.materials[i].copyFrom(src.materials[i]);
	}
}

export function resetToHumanBody(body: CharacterBody) {
	for (let bp of body.parts) {
		bp.setType(bp.typeHuman());
	}
}
