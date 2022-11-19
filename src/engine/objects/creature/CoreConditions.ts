/*
 * Created by aimozg on 20.11.2022.
 */
import {CreatureCondition} from "./CreatureCondition";

export namespace CoreConditions {
	export let Unaware = new CreatureCondition({
			name: "Unaware",
			icon: {
				text: "UA",
				fg: "#222",
				bg: "#888"
			},
			combatOnly: true
		}
	);
	export let Stealth = new CreatureCondition({
		name: "Sneaking",
		icon: {
			text: "Sn",
			fg: "#8a8",
			bg: "#242"
		},
		combatOnly: true
	});
}
