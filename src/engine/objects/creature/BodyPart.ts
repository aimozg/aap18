/*
 * Created by aimozg on 22.07.2022.
 */

import {Character} from "./Character";
import fxrng from "../../math/fxrng";
import {formatPatternNames} from "../../utils/string";

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

	protected texts = {
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
		descriptionPattern: "{longName}",
		fullDescriptionPattern: "[You] [have] {description}.",
	}
	protected textReplacer(s:string, part:PART):string {
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
	protected formatPattern(pattern:string, part:PART):string {
		return formatPatternNames(pattern, s => this.textReplacer(s, part)).replace(/^ +| +$|  +/,'').trim();
	}

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
		public readonly host: Character
	) {
		this._type = this.typeHuman();
	}
	abstract ref(): BodyPartReference<BodyPart<T>, T>;
	abstract typeNone(): T;
	abstract typeHuman(): T;

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
	size = 0;
	count = 0;
	get isPresent() { return this._type.isPresent };

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

export class BodyPartReference<PART extends BodyPart<TYPE>, TYPE extends BodyPartType<PART>> {
	private static index = 0
	static readonly All: BodyPartReference<any, any>[] = [];

	readonly index = BodyPartReference.index++;
	readonly types: Map<string, TYPE> = new Map();
	constructor(
		public readonly id: string,
		public readonly get: (host: Character) => PART,
		public readonly create: (host: Character) => PART
	) {
		BodyPartReference.All[this.index] = this;
	}
}
