/*
 * Created by aimozg on 27.08.2022.
 */
import {GameDataBuilder} from "../gdtypes";
import {GdStartingTraits} from "./traits/starting";

export function gdRegisterTraits(gd:GameDataBuilder) {
	gd.addTraits(GdStartingTraits.ALL);
}
