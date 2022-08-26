/*
 * Created by aimozg on 03.07.2022.
 */
import {ImportedGameData} from "../../game/gdtypes";
import {Game} from "../Game";

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
		for (let list of idata.scenes) data.scenes.registerMany(list);
		data.traits.clear();
		data.traits.registerMany(idata.traits)
	}



}
