/*
 * Created by aimozg on 22.07.2022.
 */

import {GameDataBuilder} from "../gdtypes";
import {EarPart, EarsRef} from "./body/Ears";
import {EyePart, EyesRef} from "./body/Eyes";
import {TailPart, TailRef} from "./body/Tail";

declare module "../../engine/objects/creature/Character" {
	interface CharacterBody {
		ears: EarPart;
		eyes: EyePart;
		tail: TailPart;
	}
}

export function gdRegisterBodyParts(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterBodyParts");
	gd.addBodyPart("ears", EarsRef);
	gd.addBodyPart("eyes", EyesRef);
	gd.addBodyPart("tail", TailRef);
}

