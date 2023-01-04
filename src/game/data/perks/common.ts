/*
 * Created by aimozg on 26.12.2022.
 */

import {createPerk} from "../../../engine/rules/PerkType";

export namespace CommonPerks {
	export let TankI = createPerk({
		id: "/pk_tabn1",
		name: "Tank I",
		description: "+1 HP per level, retroactively applied.",
		requirements(b) {
			b.requireLevel(1);
		},
		buffs: {
			hpMaxPerLevel: +1
		}
	});
	export let EnduranceI = createPerk({
		id: "/pk_endurance1",
		name: "Endurance I",
		description: "+1 EP per level, retroactively applied.",
		requirements(b) {
			b.requireLevel(1)
		},
		buffs: {
			epMaxPerLevel: +1
		}
	});
	// TODO skill focus?
	export let SeductionResistanceI = createPerk({
		id: "/pk_seductionresistance1",
		name: "Seduction Resistance I",
		description: "+1 Seduction Resistance.",
		requirements(b) {
			b.requireLevel(1)
		},
		buffs: {
			SedRes: +1
		}
	});
	export let StrongWill = createPerk({
		id: "/pk_will1",
		name: "Strong Will",
		description: "+1 Willpower.",
		requirements(b) {
			b.requireLevel(1)
		},
		buffs: {
			Willpower: 1
		}
	});
	export let Toughness = createPerk({
		id: "/pk_fortitude1",
		name: "Toughness",
		description: "+1 Fortitude.",
		requirements(b) {
			b.requireLevel(1)
		},
		buffs: {
			Fortitude: +1
		}
	});
	export let QuickReflexes = createPerk({
		id: "/pk_reflex1",
		name: "Quick Reflexes",
		description: "+1 Reflex.",
		buffs: {
			Reflex: +1
		}
	});

	/*
	export let EyesOfTheHunterBasic = createPerk({ id: "/pk_eyesofthehunter1", name: "Eyes of the Hunter (Basic)", description: "You can see exact values of enemy resource stats (AP, HP, EP, LP)." });
	export let EyesOfTheHunterAdvanced = createPerk({ id: "/pk_eyesofthehunter2", name: "Eyes of the Hunter (Advanced)", description: "You can see exact values of enemy attributes." });
	export let EyesOfTheHunterExpert = createPerk({ id: "/pk_eyesofthehunter3", name: "Eyes of the Hunter (Expert)", description: "You can see exact values of enemy defense and resistances." });
	export let EyesOfTheHunterMaster = createPerk({ id: "/pk_eyesofthehunter4", name: "Eyes of the Hunter (Master)", description: "You can see enemy abilities and skills." });
	export let EyesOfTheHunterGrandmaster = createPerk({ id: "/pk_eyesofthehunter5", name: "Eyes of the Hunter (Grandmaster)", description: "You can see enemy equipment properties." });

	export function configurePerkRequirements() {
		EyesOfTheHunterBasic.setupRequirements()
			.requireLevel(1)
			.requirePer(5);
		EyesOfTheHunterAdvanced.setupRequirements()
			.requireLevel(6)
			.requirePer(6);
		EyesOfTheHunterExpert.setupRequirements()
			.requireLevel(12)
			.requirePer(7);
		EyesOfTheHunterMaster.setupRequirements()
			.requireLevel(18)
			.requirePer(8);
		EyesOfTheHunterGrandmaster.setupRequirements()
			.requireLevel(24)
			.requirePer(9);


	}*/
}
