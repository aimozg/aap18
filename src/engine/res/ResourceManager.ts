/*
 * Created by aimozg on 03.07.2022.
 */
import {ImportedGameData} from "../../game/GameDataBuilder";
import {Game} from "../Game";
import {TileType} from "../combat/BattleGrid";
import * as tinycolor from "tinycolor2";
import {CoreSkills} from "../objects/creature/CoreSkills";

/**
 * Loads images and other resources required by game
 */
export class ResourceManager {
	constructor(
		private game:Game,
		private options: {
			loadGameData: ()=>Promise<ImportedGameData>
		}
	) {
	}
	async loadEssentialResources(): Promise<void> {
		// load everything required to launch the game
		// mods go here too I guess

		let idata = await this.options.loadGameData();
		let data = this.game.data;
		this.game.idata = idata;
		data.classes.clear();
		data.classes.registerMany(idata.classes);
		data.places.clear();
		data.places.registerMany(idata.places);
		data.racialGroups.clear();
		data.racialGroups.registerMany(idata.racialGroups)
		data.scenes.clear();
		data.scenes.registerMany(idata.scenes);
		data.skills.clear();
		data.skills.registerMany(CoreSkills.list);
		data.skills.registerMany(idata.skills, true);
		data.tiles.clear();
		data.tiles.register(TileType.FLOOR);
		for (let gdtt of idata.tiles) {
			let tt:TileType = new TileType(gdtt.id,
				gdtt.name,
				gdtt.ch,
				tinycolor(gdtt.fg ?? '#cccccc'),
				gdtt.bg ? tinycolor(gdtt.bg) : null,
				!!gdtt.walkable && !gdtt.solid,
				!!gdtt.solid)
			data.tiles.register(tt)
		}
		data.traits.clear();
		data.traits.registerMany(idata.traits)
	}



}
