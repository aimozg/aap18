/*
 * Created by aimozg on 04.07.2022.
 */

import {GameDataBuilder, ImportedGameData} from "./gdtypes";
import {gdRegisterClasses} from "./data/classes";
import {gdRegisterOrigins} from "./data/origins";
import {gdRegisterRacialGroups} from "./data/racialGroups";
import {gdRegisterStory} from "../story";
import {gdRegisterBodyParts} from "./data/bodyParts";
import {gdRegisterColors} from "./data/colors";
import {gdRegisterTraits} from "./data/traits";

export async function loadGameData():Promise<ImportedGameData> {
	let startingSceneId = '/000_intro';

	let gd = new GameDataBuilder({
		startingSceneId
	});

	gdRegisterBodyParts(gd);
	gdRegisterClasses(gd);
	gdRegisterColors(gd);
	gdRegisterOrigins(gd);
	gdRegisterRacialGroups(gd);
	gdRegisterStory(gd);
	gdRegisterTraits(gd);

	return gd.data;
}
