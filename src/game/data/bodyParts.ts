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
import {Color} from "../../engine/objects/Color";

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

		skinColor1: Color;
		skinColor2: Color;
		hairColor1: Color;
		hairColor2: Color;
		furColor1: Color;
		furColor2: Color;
		scaleColor1: Color;
		scaleColor2: Color;
		chitinColor1: Color;
		chitinColor2: Color;
		featherColor1: Color;
		featherColor2: Color;
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
	gd.addBodyMaterialColor("skinColor1", "skinColor2", BodyMaterialTypes.SKIN)
	gd.addBodyMaterialColor("hairColor1", "hairColor2", BodyMaterialTypes.HAIR)
	gd.addBodyMaterialColor("furColor1", "furColor2", BodyMaterialTypes.FUR)
	gd.addBodyMaterialColor("scaleColor1", "scaleColor2", BodyMaterialTypes.SCALES)
	gd.addBodyMaterialColor("chitinColor1", "chitinColor2", BodyMaterialTypes.CHITIN)
	gd.addBodyMaterialColor("featherColor1", "featherColor2", BodyMaterialTypes.FEATHERS)
}

