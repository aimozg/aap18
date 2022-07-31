/*
 * Created by aimozg on 03.07.2022.
 */
/**
 * Interacts with browser APIs to save/load saved states.
 */
export class SaveManager {

	constructor() {
	}

	isRecentSaveAvailable():Boolean {
		return false;
	}

	async loadAutosaveData():Promise<object> {
		throw new Error("Not implemented yet");
	}
}
