/*
 * Created by aimozg on 04.07.2022.
 */

import {CharacterClass} from "../engine/rules/classes/CharacterClass";
import {RacialGroup} from "../engine/rules/RacialGroup";
import {Scene} from "../engine/scene/Scene";
import {Place, PlaceDef} from "../engine/objects/Place";
import {buildScenes, SceneDef} from "../engine/scene/builder";
import {LogManager} from "../engine/logging/LogManager";
import {BodyPart, BodyPartReference, BodyPartType} from "../engine/objects/creature/BodyPart";
import {CharacterBody} from "../engine/objects/creature/Character";
import {BodyMaterial, BodyMaterialType} from "../engine/objects/creature/BodyMaterial";
import {Color} from "../engine/objects/Color";
import {PlayerCharacter} from "../engine/objects/creature/PlayerCharacter";

/**
 * Essential game data (races, perks, items, ...)
 */
export interface ImportedGameData {
	startingSceneId: string;
	classes: CharacterClass[];
	colors: GDColor[];
	places: Place[];
	playerOrigins: GDPlayerOrigin[];
	racialGroups: RacialGroup[];
	rgHumanoid: RacialGroup;
	scenes: Scene[][];
}

export interface GDPlayerOrigin {
	id: string;
	name: string;
	/** suitable to be prefixed with "You are.../NAME is..." */
	shortDesc: string;
	description: string;
	introText?: string;
	adjustPlayer?: (pc:PlayerCharacter)=>void;
}

export interface GDColor {
	name: string;
	rgb: string;
	tags?: string[];
	palette?: string;
}

export class GameDataBuilder {
	readonly logger = LogManager.loggerFor("GameDataBuilder")
	readonly data: ImportedGameData
	constructor(
		options: { startingSceneId: string }
	) {
		this.data = {
			startingSceneId: options.startingSceneId,
			classes: [],
			colors: [],
			places: [],
			playerOrigins: [],
			racialGroups: [],
			rgHumanoid: null,
			scenes: []
		}
	}

	addClasses(...classes: CharacterClass[]): void {
		this.data.classes.push(...classes);
	}
	addColors(colors:GDColor[]):void {
		this.data.colors.push(...colors);
	}
	addPlaces(...places: Place[]): void {
		this.data.places.push(...places);
	}
	addPlayerOrigins(...origins: GDPlayerOrigin[]): void {
		this.data.playerOrigins.push(...origins);
	}
	addRacialGroups(...groups: RacialGroup[]): void {
		this.data.racialGroups.push(...groups);
	}
	addScenes(scenes: Scene[]): void {
		this.data.scenes.push(scenes);
	}
	// this magic translates to:
	// propname is key of CharacterBody
	// and ref is body part reference to body part that's also CharacterBody[propname]
	addBodyPart<
		PROP extends keyof CharacterBody,
		PART extends BodyPart<TYPE> & CharacterBody[PROP],
		TYPE extends BodyPartType<PART>>(
			propname: PROP,
			ref: BodyPartReference<PART, TYPE>
	): void {
		const index = ref.index;
		Object.defineProperty(CharacterBody.prototype, propname, {
			configurable: false,
			enumerable: false,
			get(this:CharacterBody): PART {
				return this.parts[index] as PART
			}
		})
	}
	addBodyMaterial<
		PROP extends keyof CharacterBody,
		MATERIAL extends BodyMaterial & CharacterBody[PROP]>(
		propname: PROP,
		ref: BodyMaterialType
	):void {
		const index = ref.index;
		Object.defineProperty(CharacterBody.prototype, propname, {
			configurable: false,
			enumerable: false,
			get(this:CharacterBody): BodyMaterial {
				return this.materials[index]
			}
		})
	}
	/**
	 * Create accessors for CharacterBody named {@param prop1} and {@param prop2} to access material {@param ref}'s color1 and color2, and readonly property {@param props} for composite color name.
	 */
	addBodyMaterialColor<
		PROP1 extends keyof CharacterBody,
		PROP2 extends keyof CharacterBody,
		PROPS extends keyof CharacterBody>(
			prop1:PROP1,
			prop2:PROP2,
			props:PROPS,
			ref: BodyMaterialType):void {
		const index = ref.index;
		Object.defineProperty(CharacterBody.prototype, prop1, {
			configurable: false,
			enumerable: false,
			get(this:CharacterBody): Color {
				return this.materials[index].color1
			},
			set(this:CharacterBody, v: Color) {
				this.materials[index].color1 = v
			}
		});
		Object.defineProperty(CharacterBody.prototype, prop2, {
			configurable: false,
			enumerable: false,
			get(this:CharacterBody): Color {
				return this.materials[index].color2
			},
			set(this:CharacterBody, v: Color) {
				this.materials[index].color2 = v
			}
		});
		Object.defineProperty(CharacterBody.prototype, props, {
			configurable: false,
			enumerable: false,
			get(this:CharacterBody): string {
				return this.materials[index].colorName
			}
		});
	}

	buildPlace(def: PlaceDef): void {
		this.addPlaces(Place.build(def))
	}
	buildScenes(namespace: string, scenes: Record<string, SceneDef>): void {
		this.addScenes(buildScenes(namespace, scenes))
	}
}
