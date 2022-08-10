/*
 * Created by aimozg on 10.08.2022.
 */

import {TAttribute} from "../../engine/rules/TAttribute";
import {Creature} from "../../engine/objects/Creature";

export interface IAttrMetadata {
	id: TAttribute;
	name: string;
	description: string;
	explain: (mod: number, value: number, host: Creature) => string;
}

export const AttrMetadata: IAttrMetadata[] = [
	{
		id: TAttribute.STR,
		name: 'Strength',
		description: 'Increases melee damage and accuracy with large weapons.',
		explain: (mod) =>
			`${mod.format('+d')} melee damage, ${(mod * 5).format('+d')}% large weapon accuracy.`
	}, {
		id: TAttribute.DEX,
		name: 'Dexterity',
		description: 'Increases evasion, reflex, and accuracy with small weapons.',
		explain: (mod) =>
			`${(mod * 5).format('+d')}% dodge, ${mod.format('+d')} reflex, ${(mod * 5).format('+d')}% small weapon accuracy.`
	}, {
		id: TAttribute.CON,
		name: 'Constitution',
		description: 'Increases hit points, energy, and fortitude.',
		explain: (mod) =>
			`${mod.format('+d')} HP and energy per level, ${mod.format('+d')} fortitude.`
	}, {
		id: TAttribute.PER,
		name: 'Perception',
		description: 'Increases accuracy with ranged weapons and many spot skills.',
		explain: (mod) =>
			`${(mod * 5).format('+d')}% ranged accuracy, ${(mod * 5).format('+d')}% spot chance.`
	}, {
		id: TAttribute.INT,
		name: 'Intellect',
		description: 'Increases skill limits and growth speed.',
		explain: (mod) =>
			`${mod.format('+d')} to something skill-related`
	}, {
		id: TAttribute.WIS,
		name: 'Wisdom',
		description: 'Increases willpower.',
		explain: (mod) =>
			`${mod.format('+d')} to willpower`
	}, {
		id: TAttribute.CHA,
		name: 'Charisma',
		description: 'Increases persuasion, seduction, and follower limit.',
		explain: (mod) =>
			`${mod.format('+d')} to something seduction-related`
	}, {
		id: TAttribute.MAF,
		name: 'Magic Affinity',
		description: 'Increases spell efficiency.',
		explain: (mod) =>
			`${mod.format('+d')} to something magic-related`
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
			`${value.format('+d')} min. Perversion. ${value.format('+d')} Libido.`
	} as IStatMetadata
}
