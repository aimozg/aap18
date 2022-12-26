/*
 * Created by aimozg on 27.08.2022.
 */
import {GameDataBuilder} from "../GameDataBuilder";
import {GdStartingPerks} from "././perks/starting";

export function gdRegisterPerks(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterPerks");
	gd.addPerks(GdStartingPerks.ALL);
}
