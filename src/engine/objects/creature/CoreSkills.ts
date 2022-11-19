/*
 * Created by aimozg on 20.11.2022.
 */

import {Skill} from "./Skill";
import {TAttribute} from "../../rules/TAttribute";

export namespace CoreSkills {
	export let Ambush = new Skill("/sk_ambush", {
		name: "Ambush",
		attr: TAttribute.PER
	});
	export let Spot = new Skill("/sk_spot", {
		name: "Spot" ,
		attr: TAttribute.PER
	});
	export let Stealth = new Skill("/sk_stealth", {
		name: "Stealth",
		attr: TAttribute.DEX
	});
}
