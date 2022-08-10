/*
 * Created by aimozg on 22.07.2022.
 */

import {Character, CharacterBody} from "./Character";
import fxrng from "../../math/fxrng";
import {formatPatternNames} from "../../utils/string";
import {BodyMaterialType} from "./BodyMaterial";

export const DefaultBodyPartTexts = {
	/** noun, singular ("ear") */
	noun1: "UNKNOWN PART",
	/** noun, singular ("ears") */
	noun2: "UNKNOWN PART",
	/** primary determiner */
	type: [""],
	/** extra determiners (inserted before) */
	adj: [""],
	/** extra descriptions (inserted after) */
	suffix: [""],
	shortName1Pattern: "{type} {noun1}",
	shortName2Pattern: "{type} {noun2}",
	longName1Pattern: "{adj} {shortName1} {suffix}",
	longName2Pattern: "{adj} {shortName2} {suffix}",
	// TODO use "number of noun" fn
	descriptionPattern: "{count} {longName}",
	fullDescriptionPattern: "[You] [have] {description}.",
}

export abstract class BodyPartType<PART extends BodyPart<any>> {
	protected constructor(
		public readonly ref: BodyPartReference<any, any>,
		public readonly id: string,
		public readonly name: string) {
		ref.types.set(id, this);
	}
	isPresent = this.id !== "";
	count = this.id === "" ? 0 : 1;
	size = this.id === "" ? 0 : 1;

	// Usage note:
	// noun1/2, shortName1/2 appear inside a bigger phrase ("You have X, Y, and Z")
	// longName1/2 appear inside a phrase as a focus ("She touches your X")
	// description is main focus of a sentence ("You have X" / "You now have X")

	protected texts = Object.assign({}, DefaultBodyPartTexts)
	protected textReplacer(s: string, part: PART): string {
		if (s === 'count') {
			if (this.count === 0) return "no";
			if (this.count === 1) return fxrng.either("one", "single");
			if (this.count === 2) return fxrng.either("two", "a pair of");
			if (this.count === 3) return fxrng.either("three", "a trio of");
			// TODO us "number of noun" fn
			return String(this.count);
		}
		if (s === 'type') return fxrng.pick(this.texts.type) ?? "";
		if (s === 'adj') return fxrng.nextBoolean() ? fxrng.pick(this.texts.adj) ?? "" : "";
		if (s === 'suffix') return fxrng.pick(this.texts.suffix) ?? "";
		if (s === 'noun') return this.noun(part);
		if (s === 'noun1') return this.noun1(part);
		if (s === 'noun2') return this.noun2(part);
		if (s === 'shortName') return this.shortName(part);
		if (s === 'shortName1') return this.shortName1(part);
		if (s === 'shortName2') return this.shortName2(part);
		if (s === 'longName') return this.longName(part);
		if (s === 'longName1') return this.longName1(part);
		if (s === 'longName2') return this.longName2(part);
		if (s === 'description') return this.description(part);
		return null
	}
	formatPattern(pattern: string, part: PART): string {
		return formatPatternNames(pattern, s => this.textReplacer(s, part))
			.replace(/  +/g,' ')
			.trim();
	}
	abstract materials: Set<BodyMaterialType>
	hasMaterial(material:BodyMaterialType):boolean { return this.materials.has(material) }

	/** noun, singular ("ear") */
	noun1: BpTextFn<PART> = () => this.texts.noun1
	/** noun, plural ("ears") */
	noun2: BpTextFn<PART> = () => this.texts.noun2
	/** noun, singular/plural depending on part count */
	noun: BpTextFn<PART> = part => part.count === 1 ? this.noun1(part) : this.noun2(part)
	/** short name, singular, ("fox ear") */
	shortName1: BpTextFn<PART> = part => this.formatPattern(this.texts.shortName1Pattern, part)
	/** short name, plural, ("fox ears") */
	shortName2: BpTextFn<PART> = part => this.formatPattern(this.texts.shortName2Pattern, part)
	/** short name, ("fox ear"/"fox ears") */
	shortName: BpTextFn<PART> = part => part.count === 1 ? this.shortName1(part) : this.shortName2(part);
	/** long name, singular ("fuzzy fox ear") */
	longName1: BpTextFn<PART> = part => this.formatPattern(this.texts.longName1Pattern, part);
	/** long name, plural ("fuzzy fox ears") */
	longName2: BpTextFn<PART> = part => this.formatPattern(this.texts.longName2Pattern, part);
	/** long name, ("fuzzy fox ear"/"fuzzy fox ears") */
	longName: BpTextFn<PART> = part => part.count === 1 ? this.longName1(part) : this.longName2(part);
	/** description ("a pair of fuzzy fox ears") */
	description: BpTextFn<PART> = part => this.formatPattern(this.texts.descriptionPattern, part)
	/** full description, sentence(s) ("[You] [have] a pair of fuzzy fox ears.") */
	fullDescription: BpTextFn<PART> = part => this.formatPattern(this.texts.fullDescriptionPattern, part)
}

export type BpTextFn<P extends BodyPart<any>> = (part: P) => string;

export abstract class BodyPart<T extends BodyPartType<any>> {
	protected constructor(
		public readonly body: CharacterBody
	) {
		this._type = this.typeHuman();
		this.size = this._type.size;
		this.count = this._type.count;
	}
	get host(): Character|null { return this.body.host }
	abstract ref(): BodyPartReference<BodyPart<T>, T>;
	abstract typeNone(): T;
	abstract typeHuman(): T;
	copyFrom(other: BodyPart<T>):void {
		this.setType(other.type);
		this.size = other.size;
		this.count = other.count;
	}

	_type: T;
	get type() { return this._type }
	setType(value: T) {
		if (this._type === value) return;
		if (!this._type.isPresent && value.isPresent || this._type.isPresent && !value.isPresent) {
			this.size = value.size;
			this.count = value.count;
		}
		this._type = value;
	}
	size: number
	count: number
	get isPresent() { return this._type.isPresent };
	hasMaterial(material:BodyMaterialType):boolean { return this.isPresent && this.type.hasMaterial(material) }
	formatPattern(pattern:string):string { return this.type.formatPattern(pattern, this) }

	/** noun, singular ("ear") */
	noun1() { return this.type.noun1(this) }
	/** noun, plural ("ears") */
	noun2() { return this.type.noun2(this) }
	/** short name, singular ("fox ear") */
	shortName1() { return this.type.shortName1(this) }
	/** short name, plural ("fox ears") */
	shortName2() { return this.type.shortName2(this) }
	/** long name, singular ("fuzzy fox ear") */
	longName1() { return this.type.longName1(this) }
	/** long name, plural ("fuzzy fox ears") */
	longName2() { return this.type.longName2(this) }
	/** description ("a pair of fuzzy fox ears") */
	description() { return this.type.description(this) }
	/** full description, sentence(s) ("[You] [have] a pair of fuzzy fox ears.") */
	fullDescription() { return this.type.fullDescription(this) }
}

export abstract class BodyPartReference<PART extends BodyPart<TYPE>, TYPE extends BodyPartType<PART>> {
	private static index = 0
	static readonly All: BodyPartReference<any, any>[] = [];

	readonly index = BodyPartReference.index++;
	readonly types: Map<string, TYPE> = new Map();
	protected constructor(public readonly id: string) {
		BodyPartReference.All[this.index] = this;
	}
	abstract create(body: CharacterBody): PART;

	get(body:CharacterBody):PART {
		return body.parts[this.index] as PART
	}
}
