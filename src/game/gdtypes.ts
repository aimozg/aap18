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
import {EarPart} from "./data/body/Ears";
import {CharacterBody} from "../engine/objects/creature/Character";

// TODO ImportedGameData and GameData

/**
 * Essential game data (races, perks, items, ...)
 */
export interface ImportedGameData {
	startingSceneId: string;
	classes: CharacterClass[];
	places: Place[];
	playerOrigins: GDPlayerOrigin[];
	racialGroups: RacialGroup[];
	rgHumanoid: RacialGroup;
	scenes: Scene[][];
}

export interface GDPlayerOrigin {
	id: string;
	name: string;
	description: string;
	introText?: string;
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
			get(this:CharacterBody): EarPart {
				return this.parts[index] as EarPart
			}
		})
	}

	buildPlace(def: PlaceDef): void {
		this.addPlaces(Place.build(def))
	}
	buildScenes(namespace: string, scenes: Record<string, SceneDef>): void {
		this.addScenes(buildScenes(namespace, scenes))
	}
}
