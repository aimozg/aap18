/*
 * Created by aimozg on 17.07.2022.
 */

import {ResLib} from "../ResLib";
import {CharacterClass} from "../rules/classes/CharacterClass";
import Symbols from "../symbols";
import {RacialGroup} from "../rules/RacialGroup";
import {Scene} from "../scene/Scene";
import {Place} from "../scene/Place";
import {Color, colorSortKey} from "../objects/Color";
import {Game} from "../Game";
import {TraitType} from "../rules/TraitType";

export class GameData {
	constructor(public readonly game:Game) {}

	readonly classes = new ResLib<CharacterClass>(Symbols.ResTypeClass, "CharacterClass");
	class(id: string): CharacterClass { return this.classes.get(id) }

	colorCache = new Map<string,Color>()
	colorByName(name:string, palette:string="common"):Color {
		let ccKey = palette+"/"+name;
		if (this.colorCache.has(ccKey)) return this.colorCache.get(ccKey)!;
		let gdcolor = this.game.idata.colors.find(c=>c.palette===palette && c.name===name)
		if (!gdcolor) {
			if (palette !== "common") {
				gdcolor = this.game.idata.colors.find(c => c.palette === "common" && c.name === name)
			}
			if (!gdcolor) throw new Error("Color not found: " + ccKey)
		}
		let color = new Color(gdcolor.name, gdcolor.rgb);
		this.colorCache.set(ccKey,color)
		return color;
	}
	colorsByNames(names:string[], palette:string="common"):Color[] {
		return names.map(name=>this.colorByName(name,palette)).sortWith(colorSortKey);
	}

	readonly places = new ResLib<Place>(Symbols.ResTypePlace, "Place");
	place(id: string): Place { return this.places.get(id) }

	readonly racialGroups = new ResLib<RacialGroup>(Symbols.ResTypeRacialGroup, "RacialGroup");
	racialGroup(id: string): RacialGroup { return this.racialGroups.get(id) }

	readonly scenes = new ResLib<Scene>(Symbols.ResTypeScene, "Scene");
	scene(scene: string|Scene): Scene {
		return typeof scene === 'string' ? this.scenes.get(scene) : scene
	}
	sceneOrNull(id: string): Scene|null { return this.scenes.getOrNull(id) }

	readonly traits = new ResLib<TraitType>(Symbols.ResTypeTrait, "Trait");
	trait(id: string): TraitType {
		return this.traits.get(id)
	}
}
