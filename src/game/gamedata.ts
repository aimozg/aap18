/*
 * Created by aimozg on 04.07.2022.
 */

import {GameDataBuilder, ImportedGameData} from "./GameDataBuilder";
import {gdRegisterClasses} from "./data/classes";
import {gdRegisterOrigins} from "./data/origins";
import {gdRegisterRacialGroups} from "./data/racialGroups";
import {gdRegisterStory} from "../story";
import {gdRegisterBodyParts} from "./data/bodyParts";
import {gdRegisterColors} from "./data/colors";
import {gdRegisterTraits} from "./data/traits";
import {gdRegisterTiles} from "./data/tiles";
import {gdRegisterSkills} from "./data/skills";

export async function loadGameData():Promise<ImportedGameData> {
	let startingSceneId = '/sc000_intro';

	let gd = new GameDataBuilder({
		startingSceneId
	});

	gdRegisterBodyParts(gd);
	gdRegisterClasses(gd);
	gdRegisterColors(gd);
	gdRegisterOrigins(gd);
	gdRegisterRacialGroups(gd);
	gdRegisterSkills(gd);
	gdRegisterStory(gd);
	gdRegisterTiles(gd);
	gdRegisterTraits(gd);

	return gd.data;
}
