/*
 * Created by aimozg on 10.08.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {BodyMaterialTypes} from "./Materials";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import fxrng from "../../../engine/math/fxrng";

export abstract class BreastType extends BodyPartType<BreastPart> {
	protected constructor(id: string, name: string) {
		super(BreastsRef, id, name);
		this.count = this.isPresent ? 2 : 0;
		this.texts.noun1 = "breast"
		this.texts.noun2 = "breasts"
		this.texts.shortName1Pattern = "{sizePrefix} {noun1}"
		this.texts.shortName2Pattern = "{sizePrefix} {noun2}"
		this.texts.longName1Pattern = "{count} {adj} {sizeFull} {suffix}"
		this.texts.longName2Pattern = "{count} {adj} {sizeFull} {suffix}"
		this.texts.descriptionPattern = "{longName}"
	}
	materials = new Set([BodyMaterialTypes.SKIN])

	noun1 = () => fxrng.either("breast", "tit")
	noun2 = () => fxrng.either("breasts", "tits")
	protected textReplacer(s: string, part: BreastPart): string {
		if (s === 'count' && part.size === 0) return '';
		if (s === 'breasts') return this.textReplacer('noun', part)
		if (s === 'sizePrefixNoCup') return BreastSizeTier.find(part.size).shortPrefixNoCup(part)
		if (s === 'sizePrefix') return BreastSizeTier.find(part.size).shortPrefix(part)
		if (s === 'cup') return BreastSizeTier.find(part.size).name
		if (s === 'sizeFull') return BreastSizeTier.find(part.size).longDesc(part)
		return super.textReplacer(s, part);
	}
}

export class BreastPart extends BodyPart<BreastType> {

	constructor(body: CharacterBody) {
		super(body);
		this.size = 0;
	}
	ref() { return BreastsRef }
	typeNone() { return BreastTypes.NONE }
	typeHuman() { return BreastTypes.NORMAL }
}

export const BreastsRef: BodyPartReference<BreastPart, BreastType> = new class extends BodyPartReference<BreastPart, BreastType> {
	constructor() {super("/breasts");}
	create(body: CharacterBody): BreastPart {
		return new BreastPart(body);
	}
}

export class BreastSizeTier {
	static All = new Map<number, BreastSizeTier>()
	static Max: BreastSizeTier
	constructor(
		options: {
			value: number,
			name?: string,
			cup: string,
			shortPrefix: string[],
			longDesc?: string[]
		}
	) {
		this.value = options.value;
		this.name = options.name ?? (options.cup+"-cup");
		this.cup = options.cup;
		this.shortPrefixes = options.shortPrefix;
		this.longDescPatterns = options.longDesc ?? ["{sizePrefixNoCup} {cup} {breasts}"];
		BreastSizeTier.All.set(this.value, this)
		if ((BreastSizeTier.Max?.value ?? 0) < this.value) BreastSizeTier.Max = this;
	}
	value: number;
	name: string;
	cup: string;
	shortPrefixes: string[];
	longDescPatterns: string[];
	shortPrefix(breasts: BreastPart): string {
		if (this.cup && fxrng.nextBoolean()) return this.cup+"-cup"
		return this.shortPrefixNoCup(breasts)
	}
	shortPrefixNoCup(breasts: BreastPart): string {
		return breasts.formatPattern(fxrng.pick(this.shortPrefixes))
	}
	longDesc(breasts: BreastPart): string {
		return breasts.formatPattern(fxrng.pick(this.longDescPatterns))
	}
	static find(value: number): BreastSizeTier {
		if (BreastSizeTier.All.has(value)) return BreastSizeTier.All.get(value)
		return BreastSizeTier.Max
	}
	static list(): BreastSizeTier[] {
		return Array.from(BreastSizeTier.All.values()).sortOn("value")
	}
}

export namespace BreastSizeTiers {
	export const FLAT = new BreastSizeTier({
		value: 0,
		name: "flat",
		cup: "",
		shortPrefix: ["flat"],
		longDesc: ["flat chest"]
	});
	export const A_CUP = new BreastSizeTier({
		value: 1,
		cup: "A",
		shortPrefix: ["tiny", "very small"]
	});
	export const B_CUP = new BreastSizeTier({
		value: 2,
		cup: "B",
		shortPrefix: ["small"]
	});
	export const C_CUP = new BreastSizeTier({
		value: 3,
		cup: "C",
		shortPrefix: ["nice", "average-sized"]
	});
	export const D_CUP = new BreastSizeTier({
		value: 4,
		cup: "D",
		shortPrefix: ["large", "big", "hand-filling", "jiggly"]
	});
	export const DD_CUP = new BreastSizeTier({
		value: 5,
		cup: "DD",
		shortPrefix: ["large", "big", "hand-filling", "jiggly"]
	});
	export const E_CUP = new BreastSizeTier({
		value: 6,
		cup: "E",
		shortPrefix: ["sizeable", "hand-overflowing", "jiggly", "pillowy"]
	});
	export const F_CUP = new BreastSizeTier({
		value: 7,
		cup: "F",
		shortPrefix: ["sizeable", "hand-overflowing", "jiggling", "pillowy"]
	});
	export const G_CUP = new BreastSizeTier({
		value: 8,
		cup: "F",
		shortPrefix: ["sizeable", "huge", "jiggling", "pillowy"]
	});
	export const H_CUP = new BreastSizeTier({
		value: 8,
		cup: "H",
		shortPrefix: ["massive", "huge", "jiggling", "pillowy"]
	});
}

export namespace BreastTypes {
	export const NONE = new class extends BreastType {
		constructor() {
			super("", "none");
			this.texts.shortName1Pattern = "no breast"
			this.texts.shortName2Pattern = "no breasts"
			this.texts.descriptionPattern = "no breasts"
			this.materials.clear()
		}
	}
	export const NORMAL = new class extends BreastType {
		constructor() {
			super("/normal", "normal");
			this.texts.type = ["normal"];
			this.texts.adj = [];
		}
	}
}
