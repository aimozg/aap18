/*
 * Created by aimozg on 13.07.2022.
 */
import {RacialGroup} from "../../engine/rules/RacialGroup";
import {GameDataBuilder} from "../gdtypes";

export const RGID_ABOMINATION = 'abomination';
export const RGID_ANGEL = 'angel';
export const RGID_BEAST = 'beast';
export const RGID_CONSTRUCT = 'construct';
export const RGID_DEITY = 'deity';
export const RGID_DEMON = 'demon';
export const RGID_ELEMENTAL = 'elemental';
export const RGID_HUMANOID = 'humanoid';
export const RGID_LICH = 'lich';
export const RGID_MAGICAL_BEAST = 'magical_beast';
export const RGID_SLIME = 'slime';
export const RGID_SPIRIT = 'spirit';
export const RGID_UNDEAD = 'undead';
export const RGID_VERMIN = 'vermin';

export const RacialGroups = {
	ABOMINATION: new RacialGroup(RGID_ABOMINATION, 'Abomination'),
	ANGEL: new RacialGroup(RGID_ANGEL, 'Angel'),
	BEAST: new RacialGroup(RGID_BEAST, 'Beast'),
	CONSTRUCT: new RacialGroup(RGID_CONSTRUCT, 'Construct'),
	DEITY: new RacialGroup(RGID_DEITY, 'Deity'),
	DEMON: new RacialGroup(RGID_DEMON, 'Demon'),
	ELEMENTAL: new RacialGroup(RGID_ELEMENTAL, 'Elemental'),
	HUMANOID: new RacialGroup(RGID_HUMANOID, 'Humanoid'),
	LICH: new RacialGroup(RGID_LICH, 'Lich'),
	MAGICAL_BEAST: new RacialGroup(RGID_MAGICAL_BEAST, 'Magical Beast'),
	SLIME: new RacialGroup(RGID_SLIME, 'Slime'),
	SPIRIT: new RacialGroup(RGID_SPIRIT, 'Spirit'),
	UNDEAD: new RacialGroup(RGID_UNDEAD, 'Undead'),
	VERMIN: new RacialGroup(RGID_VERMIN, 'Vermin'),
}

export function gdRegisterRacialGroups(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterRacialGroups");
	gd.data.rgHumanoid = RacialGroups.HUMANOID;
	gd.addRacialGroups(...Object.values(RacialGroups));
}
