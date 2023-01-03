/*
 * Created by aimozg on 17.07.2022.
 */

import {ResLib} from "../ResLib";
import {CharacterClass} from "../rules/classes/CharacterClass";
import Symbols from "../symbols";
import {RacialGroup} from "../rules/RacialGroup";
import {Scene} from "../scene/Scene";
import {Place} from "../place/Place";
import {Color, colorSortKey} from "../objects/Color";
import {Game} from "../Game";
import {PerkType} from "../rules/PerkType";
import {TileType} from "../combat/BattleGrid";
import {Skill} from "../objects/creature/Skill";

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

	readonly perks = new ResLib<PerkType>(Symbols.ResTypePerk, "Perk");
	perk(id: string): PerkType {
		return this.perks.get(id)
	}
	private allObtainablePerksCached:PerkType[];
	allObtainablePerks():PerkType[] {
		// TODO sort on distance
		return this.allObtainablePerksCached ??= this.perks.values().filter(p=>p.obtainable);
	}

	readonly places = new ResLib<Place>(Symbols.ResTypePlace, "Place");
	place(place: string|Place): Place {
		return place instanceof Place ? place : this.places.get(place)
	}

	readonly racialGroups = new ResLib<RacialGroup>(Symbols.ResTypeRacialGroup, "RacialGroup");
	racialGroup(id: string): RacialGroup { return this.racialGroups.get(id) }

	readonly scenes = new ResLib<Scene>(Symbols.ResTypeScene, "Scene");
	scene(scene: string|Scene): Scene {
		return scene instanceof Scene ? scene : this.scenes.get(scene)
	}
	sceneOrNull(id: string): Scene|null { return this.scenes.getOrNull(id) }

	readonly skills = new ResLib<Skill>(Symbols.ResTypeSkill, "Skill");
	skill(id: string): Skill { return this.skills.get(id) }
	get skillList() { return this.skills.values().sortOn("name") }

	readonly tiles = new ResLib<TileType>(Symbols.ResTypeTile, "Tile");
	private tilesByChar: Record<string,TileType>|null = null;
	tile(id: string): TileType { return this.tiles.get(id) }
	tileByChar(char: string): TileType {
		if (!this.tilesByChar) {
			this.tilesByChar = {};
			for (let tt of this.tiles.values()) {
				this.tilesByChar[tt.ch] ??= tt;
			}
		}
		let tt = this.tilesByChar[char];
		if (!tt) throw new Error(`Unknown tile '${char}'`)
		return tt;
	}
}
