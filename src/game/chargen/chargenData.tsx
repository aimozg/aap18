import {PlayerCharacter} from "../../engine/objects/creature/PlayerCharacter";
import {TAttribute} from "../../engine/rules/TAttribute";

export const ChargenRules = {
	minPrimaryStat: 2,
	maxPrimaryStat: 15,
	attributePoints: 8
}

export interface CGPCData {
	player: PlayerCharacter;
	race: string | null;
	ppoints: number;
	cclass: string | null;
	// TODO traits
}

export interface CGStat {
	label: string;
	description: string;
	min: number;
	max: number;
	get(pc: PlayerCharacter): number;
	getNatural(pc: PlayerCharacter): number;
	inc(pc: PlayerCharacter): void;
	dec(pc: PlayerCharacter): void;
	explain(pc: PlayerCharacter): string;
}

class CGPrimaryStat implements CGStat {
	constructor(
		private id: TAttribute,
		public label: string,
		public description: string,
		private explainFn: (mod: number, value: number, pc: PlayerCharacter) => string
	) {}

	max: number = ChargenRules.maxPrimaryStat;
	min: number = ChargenRules.minPrimaryStat;
	inc(pc: PlayerCharacter): void {
		pc.naturalAttrs[this.id]++;
	}
	dec(pc: PlayerCharacter): void {
		pc.naturalAttrs[this.id]--;
	}
	get(pc: PlayerCharacter): number {
		return pc.naturalAttrs[this.id];
	}
	getNatural(pc: PlayerCharacter): number {
		return pc.attr(this.id);
	}
	explain(pc: PlayerCharacter): string {
		let x = this.get(pc);
		return this.explainFn(x - 5, x, pc);
	}
}

//TODO move to ChargenController
export const primaryStats: CGStat[] = [
	new CGPrimaryStat(
		TAttribute.STR,
		'Strength',
		'Increases melee damage and accuracy with large weapons.',
		(mod) =>
			`${mod.format('+d')} melee damage, ${(mod * 5).format('+d')}% large weapon accuracy.`
	),
	new CGPrimaryStat(
		TAttribute.DEX,
		'Dexterity',
		'Increases evasion, reflex, and accuracy with small weapons.',
		(mod) =>
			`${(mod * 5).format('+d')}% dodge, ${mod.format('+d')} reflex, ${(mod * 5).format('+d')}% small weapon accuracy.`
	),
	new CGPrimaryStat(
		TAttribute.CON,
		'Constitution',
		'Increases hit points, energy, and fortitude.',
		(mod) =>
			`${mod.format('+d')} HP and energy per level, ${mod.format('+d')} fortitude.`
	),
	new CGPrimaryStat(
		TAttribute.PER,
		'Perception',
		'Increases accuracy with ranged weapons and many spot skills.',
		(mod) =>
			`${(mod * 5).format('+d')}% ranged accuracy, ${(mod * 5).format('+d')}% spot chance.`
	),
	new CGPrimaryStat(
		TAttribute.INT,
		'Intellect',
		'',
		(mod) =>
			`${mod.format('+d')} to something skill-related`
	),
	new CGPrimaryStat(
		TAttribute.WIS,
		'Wisdom',
		'',
		(mod) =>
			`${mod.format('+d')} to willpower`
	),
	new CGPrimaryStat(
		TAttribute.CHA,
		'Charisma',
		'',
		(mod) =>
			`${mod.format('+d')} to something seduction-related`
	),
	new CGPrimaryStat(
		TAttribute.MAF,
		'Magic Affinity',
		'',
		(mod) =>
			`${mod.format('+d')} to something magic-related`
	)];

export const secondaryStats: CGStat[] = [{
	label: 'Libido',
	description: 'Affects lust gain',
	min: -20,
	max: 20,
	get: pc=>pc.lib + pc.cor,
	getNatural: pc=>pc.naturalLib,
	inc: pc=>pc.naturalLib++,
	dec: pc=>pc.naturalLib--,
	explain: (pc) => {
		let value = pc.lib + pc.cor;
		if (value < 0) return `Lose ${-value} lust per hour.`;
		if (value === 0) return 'No passive lust gain or decay.';
		return `Gain ${value} lust per hour.`;
	}
}, {
	label: 'Perversion',
	description: "Your character's degrees of lewdity.",
	min: 0,
	max: 20,
	get: pc=>Math.max(pc.cor, pc.perv),
	getNatural: pc=>pc.naturalPerv,
	inc: pc=>pc.naturalPerv++,
	dec: pc=>pc.naturalPerv--,
	explain: ()=>"Your character's degrees of lewdity."
}, {
	label: 'Corruption',
	description: "",
	min: 0,
	max: 10,
	get: pc=>pc.cor,
	getNatural: pc=>pc.cor,
	inc: pc=>pc.cor++,
	dec: pc=>pc.cor--,
	explain: (pc)=>{
		let value = pc.cor
		return `${value.format('+d')} min. Perversion. ${value.format('+d')} Libido.`;
	}
}]
