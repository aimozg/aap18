/*
 * Created by aimozg on 13.08.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import {BodyMaterialTypes} from "./Materials";
import fxrng from "../../../engine/math/fxrng";

export abstract class PenisType extends BodyPartType<PenisPart> {
	protected constructor(id: string, name: string) {
		super(PenisRef, id, name);
		this.texts.noun1 = "penis";
		this.texts.noun2 = "penises";
		this.texts.longName1Pattern = "{adj} {sizeFull} {suffix}"
		this.texts.longName2Pattern = "{adj} {sizeFull} {suffix}"
		// TODO length
		this.texts.descriptionPattern = "{longName}";
	}
	materials = new Set([BodyMaterialTypes.SKIN]);

	// TODO size/type-dependent
	noun1 = () => fxrng.either("penis", "cock", "dick")
	noun2 = () => fxrng.either("penises", "cocks", "dicks")

	protected textReplacer(s: string, part: PenisPart): string {
		if (s === 'penis') return this.formatPattern('{type} {noun}', part);
		if (s === 'sizePrefix') return PenisSizeTier.find(part.size).shortPrefix(part);
		if (s === 'sizeFull') return PenisSizeTier.find(part.size).longDesc(part);
		return super.textReplacer(s, part);
	}
}

export class PenisPart extends BodyPart<PenisType> {
	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return PenisRef }
	typeNone(): PenisType { return PenisTypes.NONE; }
	typeHuman(): PenisType { return PenisTypes.HUMAN; }
}

export const PenisRef: BodyPartReference<PenisPart, PenisType> = new class extends BodyPartReference<PenisPart, PenisType> {
	constructor() {super("/penis");}
	create(body: CharacterBody): PenisPart {
		return new PenisPart(body);
	}
}

export class PenisSizeTier {
	static All: PenisSizeTier[] = []
	static Max: PenisSizeTier
	constructor(
		options: {
			min?: number,
			max?: number,
			value?: number,
			name: string,
			shortPrefix: string[],
			longDesc?: string[]
		}
	) {
		this.min = options.min ?? options.value!;
		this.max = options.max ?? options.value!;
		this.value = Math.floor((this.min+this.max)/2);
		this.name = options.name;
		this.shortPrefixes = options.shortPrefix;
		this.longDescPatterns = options.longDesc ?? this.shortPrefixes.map(spx => spx+" {penis}");
		PenisSizeTier.All.push(this);
		PenisSizeTier.All.sortOn("min");
		if ((PenisSizeTier.Max?.max??0) < this.max) PenisSizeTier.Max = this;
	}
	min: number;
	max: number;
	value: number;
	name: string;
	shortPrefixes: string[];
	longDescPatterns: string[];
	contains(value:number):boolean {
		return this.min <= value && value <= this.max;
	}
	shortPrefix(penis: PenisPart): string {
		return penis.formatPattern(fxrng.pick(this.shortPrefixes))
	}
	longDesc(penis: PenisPart): string {
		return penis.formatPattern(fxrng.pick(this.longDescPatterns))
	}
	static find(value:number): PenisSizeTier {
		return PenisSizeTier.All.find(pst => pst.contains(value)) ?? PenisSizeTier.Max;
	}
	static list():PenisSizeTier[] {
		return PenisSizeTier.All.slice();
	}
}

export namespace PenisSizeTiers {
	export const NONE = new PenisSizeTier({
		value: 0,
		name: "no",
		shortPrefix: ["non-existant"]
	});
	export const T0_SMALL = new PenisSizeTier({
		value: 1,
		name: "micro",
		shortPrefix: ["tiny", "micro", "clit-like"],
		longDesc: ["tiny clit-like {penis}"]
	});
	export const T1_VERY_SMALL = new PenisSizeTier({
		min: 2,
		max: 3,
		name: "mini",
		shortPrefix: ["very small", "very short", "mini"]
	});
	export const T2_SMALL = new PenisSizeTier({
		min: 4,
		max: 5,
		name: "small",
		shortPrefix: ["small", "short"],
		longDesc: ["[either:short|small] {penis}"]
	});
	export const T4_AVERAGE = new PenisSizeTier({
		min: 6,
		max: 8,
		name: "average",
		shortPrefix: ["average", "average-length", "decent"]
	});
	export const T5_BIG = new PenisSizeTier({
		min: 9,
		max: 10,
		name: "big",
		shortPrefix: ["big", "large", "long"],
		longDesc: ["[either:big|large|long][either:| and thick] {penis}"]
	});
	export const T6_VERY_BIG = new PenisSizeTier({
		min: 11,
		max: 12,
		name: "very big",
		shortPrefix: ["very big", "very large", "very long"],
		longDesc: ["very [either:big|large|long][either:| and very thick| and thick] {penis}"]
	});
	export const T7_HUGE = new PenisSizeTier({
		min: 13,
		max: 15,
		name: "huge",
		shortPrefix: ["huge"]
	});
	export const T8_MASSIVE = new PenisSizeTier({
		min: 16,
		max: 18,
		name: "massive",
		shortPrefix: ["massive","enormous"]
	});
	export const T9_GIGANTIC = new PenisSizeTier({
		min: 19,
		max: 21,
		name: "gigantic",
		shortPrefix: ["gigantic","giant","extremely large","extremely big"]
	});
}

export namespace PenisTypes {
	export const NONE = new class extends PenisType {
		constructor() {
			super("", "none");
			this.texts.noun1 = "no penis";
			this.texts.noun2 = "no penises";
			this.texts.descriptionPattern = "no penis";
			this.materials.clear()
		}
	}
	export const HUMAN = new class extends PenisType {
		constructor() {
			super("/human", "human");
			this.texts.type = ["human"];
			this.texts.adj = ["ordinary", "normal"];
		}
	}
	////////
	export const CAT = new class extends PenisType {
		constructor() {
			super("/cat", "cat");
			this.texts.type = ["cat", "feline"];
			this.texts.adj = ["barbed", "pointy", "furry"];
			this.materials.add(BodyMaterialTypes.FUR);
		}
	}
	export const DOG = new class extends PenisType {
		constructor() {
			super("/dog", "dog");
			this.texts.type = ["dog", "canine"];
			this.texts.adj = ["knotted", "pointy", "furry"];
			this.materials.add(BodyMaterialTypes.FUR);
		}
	}
}
