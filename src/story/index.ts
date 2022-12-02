/*
 * Created by aimozg on 17.07.2022.
 */
import {GameDataBuilder} from "../game/GameDataBuilder";
import {IntroScenes} from "./intro/intro";
import {CampScenes} from "./camp/camp";

export namespace SceneLib {
	export let Intro = IntroScenes;
	export let Camp = CampScenes;
}

export function gdRegisterStory(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterStory");
	gd.addSceneLib(SceneLib);
}
