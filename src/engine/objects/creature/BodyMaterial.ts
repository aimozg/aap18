/*
 * Created by aimozg on 01.08.2022.
 */

import {CharacterBody} from "./Character";
import {Color} from "../Color";
import fxrng from "../../math/fxrng";
import {formatPatternNames} from "../../utils/string";

export class BodyMaterial {
	constructor(
		public readonly type:BodyMaterialType,
		public readonly body:CharacterBody) {
	}

	get colorName():string {
		if (this.singleColor) return this.color1.name
		return this.color1.name+" and "+this.color2.name
	}
	color1: Color = Color.DEFAULT_WHITE
	color2: Color = Color.DEFAULT_WHITE
	get singleColor() { return this.color1.equals(this.color2)}
	get binaryColor() { return !this.singleColor }

	get isPresent():boolean {
		return this.body.parts.some(part=>part.hasMaterial(this.type));
	}

	get name() { return this.type.name }
	// TODO extract to text common
	verb(singular:string, plural:string) { return this.type.plural ? plural : singular }
	get isAre() { return this.verb("is","are")}
	get hasHave() { return this.verb("has","have")}

	textReplacer(s: string): string {
		if (s === 'color') return this.colorName
		if (s === 'name') return this.name
		if (s === 'shortName') return this.shortName()
		if (s === 'description') return this.description()
		if (s === 'is') return this.isAre
		if (s === 'has') return this.hasHave
		return s
	}
	shortName(): string {
		return this.formatPattern("{color} {name}")
	}
	description(): string {
		// TODO adj
		return this.formatPattern("{shortName}")
	}
	fullDescription():string {
		return this.formatPattern(fxrng.either(
			"[You] [have] {description}.",
			"[Your] {name} {is} {color}." // TODO adj
		))
	}
	protected formatPattern(pattern:string):string {
		return formatPatternNames(pattern,s => this.textReplacer(s))
			.replace(/  +/g,' ')
			.trim()
	}
}

export class BodyMaterialType {
	private static index = 0;
	static readonly All: BodyMaterialType[] = [];

	readonly index = BodyMaterialType.index++;
	constructor(
		public readonly id: string,
		public name: string,
		public plural: boolean
	) {
		BodyMaterialType.All[this.index] = this;
	}

	get(body:CharacterBody):BodyMaterial {
		return body.materials[this.index];
	}
	create(body:CharacterBody):BodyMaterial {
		return new BodyMaterial(this, body)
	}
}