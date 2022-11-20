/*
 * Created by aimozg on 10.08.2022.
 */

import {TAttribute} from "../../engine/rules/TAttribute";
import {Creature} from "../../engine/objects/Creature";
import {CombatRules} from "../combat/CombatRules";

export interface IAttrMetadata {
	id: TAttribute;
	name: string;
	abbr: string;
	description: string;
	explain: (mod: number, value: number, host: Creature) => string;
}

export const AttrMetadata: IAttrMetadata[] = [
	{
		id: TAttribute.STR,
		name: 'Strength',
		abbr: "STR",
		description: 'Raw physical power.',
		explain: (mod) =>
			`${mod.signed()} melee damage (non-small weapons), ${(mod * 5).signed()}% huge weapon accuracy.`
	}, {
		id: TAttribute.DEX,
		name: 'Dexterity',
		abbr: "DEX",
		description: 'Finesse and coordination.',
		explain: (mod) =>
			`${(mod * 5).signed()}% dodge, ${mod.signed()} reflex, ${(mod * 5).signed()}% medium and large weapon accuracy, ${mod.signed()} small weapon damage.`
	}, {
		id: TAttribute.CON,
		name: 'Constitution',
		abbr: "CON",
		description: 'Endurance.',
		explain: (mod) =>
			`${mod.signed()} HP and energy per level, ${mod.signed()} fortitude.`
	}, {
		id: TAttribute.SPE,
		name: 'Speed',
		abbr: "SPE",
		description: 'Decreases actions\' AP cost.',
		explain: (mod,value) =>
			`${(CombatRules.speedApFactor(value)-1).format('+d%')}% action AP cost, ${(CombatRules.speedApFactorMove(value)-1).format('+d%')}% move AP cost, ${(mod * 5).signed()}% small weapon accuracy.`
	}, {
		id: TAttribute.PER,
		name: 'Perception',
		abbr: "PER",
		description: 'Eyesight, hearing, and other senses.',
		explain: (mod) =>
			`${(mod * 5).signed()}% ranged accuracy.`
	}, {
		id: TAttribute.INT,
		name: 'Intellect',
		abbr: "INT",
		description: 'Analytical abilities.',
		explain: (mod) =>
			`${mod.signed()} to skill points per level. ${(mod*5).signed()}% skill growth speed.`
	}, {
		id: TAttribute.WIS,
		name: 'Wisdom',
		abbr: "WIS",
		description: 'Common sense and willpower.',
		explain: (mod) =>
			`${mod.signed()} to willpower.`
	}, {
		id: TAttribute.CHA,
		name: 'Charisma',
		abbr: "CHA",
		description: 'Physical and personal attractiveness.',
		explain: (mod) =>
			`${mod.signed()} to something seduction-related.`
	}
];

export interface IStatMetadata {
	id: keyof Creature;
	name: string;
	description: string;
	explain: (value: number, host: Creature) => string;
}

export const StatMetadata = {
	lib: {
		id: "lib",
		name: "Libido",
		description: 'Affects lust gain',
		explain: (value) => {
			if (value < 0) return `Lose ${-value} lust per hour.`;
			if (value === 0) return 'No passive lust gain or decay.';
			return `Gain ${value} lust per hour.`;
		}
	} as IStatMetadata,
	perv: {
		id: "perv",
		name: "Perversion",
		description: "Your character's degrees of lewdity.",
		// TODO Explain perversion values in detail (from hand-holding to nipplecunt fisting)
		explain: () => "Your character's degrees of lewdity."
	} as IStatMetadata,
	cor: {
		id: "cor",
		name: "Corruption",
		description: "", // TODO Corruption stat description
		explain: (value) =>
			`${value.signed()} min. Perversion. ${value.signed()} Libido.`
	} as IStatMetadata
}
