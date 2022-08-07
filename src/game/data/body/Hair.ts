/*
 * Created by aimozg on 07.08.2022.
 */

import {BodyPart, BodyPartReference, BodyPartType} from "../../../engine/objects/creature/BodyPart";
import {CharacterBody} from "../../../engine/objects/creature/Character";
import {BodyMaterialTypes} from "./Materials";
import fxrng from "../../../engine/math/fxrng";

export abstract class HairType extends BodyPartType<HairPart> {
	protected constructor(id: string, name: string) {
		super(HairRef, id, name);
		this.texts.noun1 = "hair"
		this.texts.noun2 = "hairs"
		this.texts.shortName1Pattern = "{lengthPrefix} {color} {noun1}"
		this.texts.longName1Pattern = "{adj} {lengthFull} {suffix}"
		this.texts.descriptionPattern = "{longName1}"
	}
	materials = new Set([BodyMaterialTypes.HAIR]);
	protected textReplacer(s: string, part: HairPart): string {
		if (s === 'hair') return this.formatPattern("{color} {type} {noun1}", part)
		if (s === 'lengthPrefix') return HairLengthTier.find(part.size).shortPrefix(part)
		if (s === 'lengthFull') return HairLengthTier.find(part.size).longDesc(part)
		if (s === 'color') return part.body.hairColors;
		if (s === 'color1') return part.body.hairColor1.name;
		if (s === 'color2') return part.body.hairColor2.name;
		return super.textReplacer(s, part);
	}

}

export class HairPart extends BodyPart<HairType> {

	constructor(body: CharacterBody) {
		super(body);
	}
	ref() { return HairRef}
	typeNone() { return HairTypes.NONE }
	typeHuman() { return HairTypes.NORMAL }

	get length() { return this.size }
	set length(value: number) { this.size = value }
}

export const HairRef: BodyPartReference<HairPart, HairType> = new class extends BodyPartReference<HairPart, HairType> {
	constructor() {super("/hair");}
	create(body: CharacterBody): HairPart {
		return new HairPart(body);
	}
}

export class HairLengthTier {
	static All = new Map<number, HairLengthTier>()
	static Max: HairLengthTier
	constructor(
		options: {
			value: number,
			name: string,
			shortPrefix: string[],
			longDesc: string[]
		}
	) {
		this.value = options.value;
		this.name = options.name;
		this.shortPrefixes = options.shortPrefix;
		this.longDescPatterns = options.longDesc;
		HairLengthTier.All.set(this.value, this)
		if ((HairLengthTier.Max?.value ?? 0) < this.value) HairLengthTier.Max = this;
	}
	value: number
	name: string
	shortPrefixes: string[]
	longDescPatterns: string[]
	shortPrefix(hair: HairPart): string {
		return hair.formatPattern(fxrng.pick(this.shortPrefixes))
	}
	longDesc(hair: HairPart): string {
		return hair.formatPattern(fxrng.pick(this.longDescPatterns))
	}
	static find(value: number): HairLengthTier {
		if (HairLengthTier.All.has(value)) return HairLengthTier.All.get(value)
		return HairLengthTier.Max
	}
	static list(): HairLengthTier[] {
		return Array.from(HairLengthTier.All.values()).sortOn("value")
	}
}

export namespace HairLengthTiers {
	export const T0_BALD = new HairLengthTier({
		value: 0,
		name: "bald",
		shortPrefix: ["no"],
		longDesc: ["bald head", "no hair"]
	});
	/** Very short */
	export const T1_VERY_SHORT = new HairLengthTier({
		value: 1,
		name: "very short",
		shortPrefix: ["very short"],
		longDesc: ["very short {hair}"]
	});
	/** Ear-length */
	export const T2_SHORT = new HairLengthTier({
		value: 2,
		name: "short",
		shortPrefix: ["short"],
		longDesc: ["short {hair}"]
	});
	/** Chin-length (average masculine)  */
	export const T3_BELOW_AVERAGE = new HairLengthTier({
		value: 3,
		name: "chin-length",
		shortPrefix: ["average length", "chin-length"],
		longDesc: ["{hair} reaching your chin", "chin-length {hair}"]
	});
	/** Shoulder-length (average feminine) */
	export const T4_ABOVE_AVERAGE = new HairLengthTier({
		value: 4,
		name: "shoulder-length",
		shortPrefix: ["somewhat long", "shoulder-length"],
		longDesc: ["{hair} reaching your shoulders", "shoulder-length {hair}"]
	})
	/** Reaches chest/middle of back */
	export const T5_LONG = new HairLengthTier({
		value: 5,
		name: "long",
		shortPrefix: ["long", "chest-long"],
		longDesc: ["long {hair} [either:reaching|that reaches] [either:your chest|middle of your back]", "chest-long {hair}"]
	})
	/** Waist-long hair */
	export const T6_VERY_LONG = new HairLengthTier({
		value: 6,
		name: "very long",
		shortPrefix: ["very long", "waist-long"],
		longDesc: ["very long {hair} [either:reaching|that reaches] [either:your butt|your waist|your hips]","[either:waist|butt|hip]-long {hair}"]
	})
	/** Knee-long */
	export const T7_EXTREMELY_LONG = new HairLengthTier({
		value: 7,
		name: "extremely long",
		shortPrefix: ["extremely long", "knee-length"],
		longDesc: ["extremely long {hair} [either:reaching|that reaches] your knees", "knee-length {hair}"]
	}) /* TODO what if no knees? */
	/** Feet-long */
	export const T8_ABSURDLY_LONG = new HairLengthTier({
		value: 8,
		name: "absurdly long",
		shortPrefix: ["absurdly long", "feet-reaching", "floor-dragging"],
		longDesc: ["absurdly long {hair} [either:reaching|that reaches] your [feet]"]
	})
}

export namespace HairTypes {
	export const NONE = new class extends HairType {
		constructor() {
			super("", "none");
			this.texts.shortName1Pattern = "no hair";
			this.materials.clear()
		}
	}
	export const NORMAL = new class extends HairType {
		constructor() {
			super("/normal", "normal");
			this.texts.type = ["normal"];
			this.texts.adj = [];
		}
	}
}
