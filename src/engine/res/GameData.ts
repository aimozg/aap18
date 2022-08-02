/*
 * Created by aimozg on 17.07.2022.
 */

import {ResLib} from "../ResLib";
import {CharacterClass} from "../rules/classes/CharacterClass";
import Symbols from "../symbols";
import {RacialGroup} from "../rules/RacialGroup";
import {Scene} from "../scene/Scene";
import {Place} from "../objects/Place";

export class GameData {
	readonly classes = new ResLib<CharacterClass>(Symbols.ResTypeClass, "CharacterClass");
	class(id: string): CharacterClass { return this.classes.get(id) }

	readonly places = new ResLib<Place>(Symbols.ResTypePlace, "Place");
	place(id: string): Place { return this.places.get(id) }

	readonly racialGroups = new ResLib<RacialGroup>(Symbols.ResTypeRacialGroup, "RacialGroup");
	racialGroup(id: string): RacialGroup { return this.racialGroups.get(id) }

	readonly scenes = new ResLib<Scene>(Symbols.ResTypeScene, "Scene");
	scene(scene: string|Scene): Scene {
		return typeof scene === 'string' ? this.scenes.get(scene) : scene
	}
	sceneOrNull(id: string): Scene|null { return this.scenes.getOrNull(id) }
}
