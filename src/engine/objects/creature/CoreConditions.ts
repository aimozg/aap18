/*
 * Created by aimozg on 20.11.2022.
 */
import {CreatureCondition} from "./CreatureCondition";

export namespace CoreConditions {
	export let Defeated = new CreatureCondition("/cd_disabled", {
		name: "Defeated",
		description: "This creature has fallen in battle.",
		icon: {
			text: "X",
			fg: "#222",
			bg: "#822"
		},
		combatOnly: true
	})
	export let Seduced = new CreatureCondition("/cd_seduced", {
		name: "Seduced",
		description: "This creature was seduced and won't fight.",
		icon: {
			text: "Sd",
			fg: "#a8a",
			bg: "#822"
		},
		combatOnly: true
	});
	export let Stealth = new CreatureCondition("/cd_stealth", {
		name: "Sneaking",
		description: "Invisible to enemies. Can perform sneak attack. This creature Stealth skill is checked vs enemies' Spot.",
		icon: {
			text: "Sn",
			fg: "#8a8",
			bg: "#242"
		},
		combatOnly: true
	});
	export let Unaware = new CreatureCondition("/cd_unaware", {
			name: "Unaware",
			description: "This creature won't perform any hostile actions.",
			icon: {
				text: "UA",
				fg: "#222",
				bg: "#888"
			},
			combatOnly: true
		}
	);
}
