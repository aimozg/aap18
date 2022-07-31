/*
 * Created by aimozg on 17.07.2022.
 */
import {GameDataBuilder} from "../game/gdtypes";
import {gdRegisterIntro} from "./intro/intro";
import {gdRegisterPlayerBase} from "./base/base";


export function gdRegisterStory(gd:GameDataBuilder) {
	gdRegisterIntro(gd);
	gdRegisterPlayerBase(gd);
}
