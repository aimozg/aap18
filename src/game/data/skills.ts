/*
 * Created by aimozg on 20.11.2022.
 */

import {Skill} from "../../engine/objects/creature/Skill";
import {TAttribute} from "../../engine/rules/TAttribute";
import {CoreSkills} from "../../engine/objects/creature/CoreSkills";
import {GameDataBuilder} from "../GameDataBuilder";

export namespace Skills {
	export const Ambush = CoreSkills.Ambush;
	export const Alchemy = new Skill("/sk_alchemy", {
		name: "Alchemy",
		attr: TAttribute.INT,
		description: "Alchemical crafting."
	});
	export const Arcana = new Skill("/sk_arcana", {
		name: "Arcana",
		attr: TAttribute.INT,
		description: "I don't know what it does, ask Lia."
	});
	export const Enchanting = new Skill("/sk_enchanting", {
		name: "Enchanting",
		attr: TAttribute.INT,
		description: "Magical crafting."
	});
	export const Seduce = CoreSkills.Seduce;
	export const Smithing = new Skill("/sk_smithing", {
		name: "Smithing",
		attr: TAttribute.STR,
		description: "Weapon and armor crafting, and other metalwork."
	});
	export const Spot = CoreSkills.Spot;
	export const Stealth = CoreSkills.Stealth;

	export const list = [
		Ambush,
		Alchemy,
		Arcana,
		Enchanting,
		Seduce,
		Smithing,
		Spot,
		Stealth
	];
}

export function gdRegisterSkills(gd:GameDataBuilder) {
	// register non-core skills
	gd.addSkills(Skills.list.filter(skill=>!CoreSkills.list.includes(skill)));
}
