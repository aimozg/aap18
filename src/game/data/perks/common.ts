/*
 * Created by aimozg on 26.12.2022.
 */

import {SimplePerkType} from "../../../engine/rules/PerkType";

export namespace CommonPerks {
	export let TankI = new SimplePerkType("/pk_tank1",
		"Tank I",
		"+1 HP per level, retroactively applied.");
	export let EnduranceI = new SimplePerkType("/pk_endurance1",
		"Endurance I",
		"+1 EP per level, retroactively applied.");
	// TODO skill focus?
	export let SeductionResistanceI = new SimplePerkType("/pk_seductionresistance1",
		"Seduction Resistance I",
		"+1 Seduction Resistance.");
	export let StrongWill = new SimplePerkType("/pk_will1",
		"Strong Will",
		"+1 Willpower.");
	export let Toughness = new SimplePerkType("/pk_fortitude1",
		"Toughness",
		"+1 Fortitude.");
	export let QuickReflexes = new SimplePerkType("/pk_reflex1",
		"Quick Reflexes",
		"+1 Reflex.");

	export let EyesOfTheHunterBasic = new SimplePerkType("/pk_eyesofthehunter1",
		"Eyes of the Hunter (Basic)",
		"You can see exact values of enemy resource stats (AP, HP, EP, LP).");
	export let EyesOfTheHunterAdvanced = new SimplePerkType("/pk_eyesofthehunter2",
		"Eyes of the Hunter (Advanced)",
		"You can see exact values of enemy attributes.");
	export let EyesOfTheHunterExpert = new SimplePerkType("/pk_eyesofthehunter3",
		"Eyes of the Hunter (Expert)",
		"You can see exact values of enemy defense and resistances.");
	export let EyesOfTheHunterMaster = new SimplePerkType("/pk_eyesofthehunter4",
		"Eyes of the Hunter (Master)",
		"You can see enemy abilities and skills.");
	export let EyesOfTheHunterGrandmaster = new SimplePerkType("/pk_eyesofthehunter5",
		"Eyes of the Hunter (Grandmaster)",
		"You can see enemy equipment properties.");

	export let ALL = [];
}
