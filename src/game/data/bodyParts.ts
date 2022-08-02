/*
 * Created by aimozg on 22.07.2022.
 */

import {GameDataBuilder} from "../gdtypes";
import {EarPart, EarsRef} from "./body/Ears";
import {EyePart, EyesRef} from "./body/Eyes";
import {TailPart, TailRef} from "./body/Tail";
import {ArmPart, ArmsRef} from "./body/Arms";
import {BodyMaterial} from "../../engine/objects/creature/BodyMaterial";
import {BodyMaterialTypes} from "./body/Materials";

declare module "../../engine/objects/creature/Character" {
	interface CharacterBody {
		arms: ArmPart;
		ears: EarPart;
		eyes: EyePart;
		tail: TailPart;

		bmSkin: BodyMaterial;
		bmHair: BodyMaterial;
		bmFur: BodyMaterial;
		bmScales: BodyMaterial;
		bmChitin: BodyMaterial;
		bmFeathers: BodyMaterial;
	}
}

export function gdRegisterBodyParts(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterBodyParts");
	gd.addBodyPart("arms", ArmsRef);
	gd.addBodyPart("ears", EarsRef);
	gd.addBodyPart("eyes", EyesRef);
	gd.addBodyPart("tail", TailRef);
	gd.addBodyMaterial("bmSkin", BodyMaterialTypes.SKIN)
	gd.addBodyMaterial("bmHair", BodyMaterialTypes.HAIR)
	gd.addBodyMaterial("bmFur", BodyMaterialTypes.FUR)
	gd.addBodyMaterial("bmScales", BodyMaterialTypes.SCALES)
	gd.addBodyMaterial("bmChitin", BodyMaterialTypes.CHITIN)
	gd.addBodyMaterial("bmFeathers", BodyMaterialTypes.FEATHERS)
}

