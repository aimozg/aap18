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
import {LegPart, LegsRef} from "./body/Legs";
import {HairPart, HairRef} from "./body/Hair";
import {WingPart, WingsRef} from "./body/Wings";
import {HornPart, HornsRef} from "./body/Horns";
import {FacePart, FaceRef} from "./body/Face";
import {BreastPart, BreastsRef} from "./body/Breasts";
import {PenisPart, PenisRef} from "./body/Penis";
import {VaginaPart, VaginaRef} from "./body/Vagina";
import {CoatPart, CoatRef} from "./body/Coat";
import {SkinPart, SkinRef} from "./body/Skin";

declare module "../../engine/objects/creature/Character" {
	interface CharacterBody {
		readonly arms: ArmPart;
		readonly breasts: BreastPart;
		readonly coat: CoatPart;
		readonly ears: EarPart;
		readonly eyes: EyePart;
		readonly face: FacePart;
		readonly hair: HairPart;
		readonly horns: HornPart;
		readonly legs: LegPart;
		readonly penis: PenisPart;
		readonly skin: SkinPart;
		readonly tail: TailPart;
		readonly vagina: VaginaPart;
		readonly wings: WingPart;

		readonly bmSkin: BodyMaterial;
		readonly bmHair: BodyMaterial;
		readonly bmFur: BodyMaterial;
		readonly bmScales: BodyMaterial;
		readonly bmChitin: BodyMaterial;
		readonly bmFeathers: BodyMaterial;

		skinColor1: Color;
		skinColor2: Color;
		readonly skinColors: string;
		hairColor1: Color;
		hairColor2: Color;
		readonly hairColors: string;
		furColor1: Color;
		furColor2: Color;
		readonly furColors: string;
		scaleColor1: Color;
		scaleColor2: Color;
		readonly scaleColors: string;
		chitinColor1: Color;
		chitinColor2: Color;
		readonly chitinColors: string;
		featherColor1: Color;
		featherColor2: Color;
		readonly featherColors: string;
	}
}

export function gdRegisterBodyParts(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterBodyParts");
	gd.addBodyPart("arms", ArmsRef);
	gd.addBodyPart("breasts", BreastsRef);
	gd.addBodyPart("coat", CoatRef);
	gd.addBodyPart("ears", EarsRef);
	gd.addBodyPart("eyes", EyesRef);
	gd.addBodyPart("face", FaceRef);
	gd.addBodyPart("hair", HairRef);
	gd.addBodyPart("horns", HornsRef);
	gd.addBodyPart("legs", LegsRef);
	gd.addBodyPart("penis", PenisRef);
	gd.addBodyPart("skin", SkinRef);
	gd.addBodyPart("tail", TailRef);
	gd.addBodyPart("vagina", VaginaRef);
	gd.addBodyPart("wings", WingsRef);
	gd.addBodyMaterial("bmSkin", BodyMaterialTypes.SKIN)
	gd.addBodyMaterial("bmHair", BodyMaterialTypes.HAIR)
	gd.addBodyMaterial("bmFur", BodyMaterialTypes.FUR)
	gd.addBodyMaterial("bmScales", BodyMaterialTypes.SCALES)
	gd.addBodyMaterial("bmChitin", BodyMaterialTypes.CHITIN)
	gd.addBodyMaterial("bmFeathers", BodyMaterialTypes.FEATHERS)
	gd.addBodyMaterialColor("skinColor1", "skinColor2", "skinColors", BodyMaterialTypes.SKIN)
	gd.addBodyMaterialColor("hairColor1", "hairColor2", "hairColors", BodyMaterialTypes.HAIR)
	gd.addBodyMaterialColor("furColor1", "furColor2", "furColors", BodyMaterialTypes.FUR)
	gd.addBodyMaterialColor("scaleColor1", "scaleColor2", "scaleColors", BodyMaterialTypes.SCALES)
	gd.addBodyMaterialColor("chitinColor1", "chitinColor2", "chitinColors", BodyMaterialTypes.CHITIN)
	gd.addBodyMaterialColor("featherColor1", "featherColor2", "featherColors", BodyMaterialTypes.FEATHERS)
}

