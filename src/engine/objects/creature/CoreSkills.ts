/*
 * Created by aimozg on 20.11.2022.
 */

import {Skill} from "./Skill";
import {TAttribute} from "../../rules/TAttribute";

export namespace CoreSkills {
	export const Ambush = new Skill("/sk_ambush", {
		name: "Ambush",
		attr: TAttribute.PER,
		description: "Used in exploration. Successful Ambush check gives you the initiative in the encounter."
	});
	export const Seduce = new Skill("/sk_seduce", {
		name: "Seduce",
		attr: TAttribute.CHA,
		description: "Successful Seduce check makes enemy surrender."
	});
	export const Spot = new Skill("/sk_spot", {
		name: "Spot",
		attr: TAttribute.PER,
		description: "Detect sneaking enemies, rolled vs enemy Stealth skill."
	});
	export const Stealth = new Skill("/sk_stealth", {
		name: "Stealth",
		attr: TAttribute.DEX,
		description: "Move undetected, rolled vs enemy Spot skill."
	});

	export const list = [
		Ambush,
		Seduce,
		Spot,
		Stealth
	];
}
