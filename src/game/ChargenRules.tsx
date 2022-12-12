import {BreastSizeTiers} from "./data/body/Breasts";
import {PenisSizeTiers} from "./data/body/Penis";
import {LevelRules} from "../engine/rules/LevelRules";

export const ChargenRules = {
	minAttr: 2,
	maxAttr: 15,
	defaultAttr: 5,
	attributePoints: 8,

	minLib: -20,
	maxLib: 20,
	minPerv: 0,
	maxPerv: 20,
	minCor: 0,
	maxCor: 10,

	skillPoints: LevelRules.SkillPointsGainBase*4,
	skillPointsPerIntMod: LevelRules.SkillPointsGainPerIntMod*4,
	skillMax: 4,

	breastsMaxMale: BreastSizeTiers.FLAT.value,
	breastsMinFemale: BreastSizeTiers.FLAT.value,
	breastsMaxFemale: BreastSizeTiers.H_CUP.value,
	penisMin: PenisSizeTiers.T1_VERY_SMALL.min,
	penisMax: PenisSizeTiers.T6_VERY_BIG.max,
}

