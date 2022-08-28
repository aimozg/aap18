/*
 * Created by aimozg on 17.07.2022.
 */
import {GameDataBuilder} from "../game/gdtypes";
import {gdRegisterIntro} from "./intro/intro";
import {gdRegisterPlayerBase} from "./base/base";


export function gdRegisterStory(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterStory");
	gdRegisterIntro(gd);
	gdRegisterPlayerBase(gd);
}
