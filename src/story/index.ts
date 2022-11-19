/*
 * Created by aimozg on 17.07.2022.
 */
import {GameDataBuilder} from "../game/GameDataBuilder";
import {gdRegisterIntro} from "./intro/intro";
import {gdRegisterPlayerCamp} from "./camp/camp";


export function gdRegisterStory(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterStory");
	gdRegisterIntro(gd);
	gdRegisterPlayerCamp(gd);
}
