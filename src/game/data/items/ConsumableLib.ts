import {BaseConsumable} from "../../../engine/objects/item/BaseConsumable";
import {HealEffect} from "./effects/HealEffect";

export namespace ConsumableLib {
	export const PotionHealingLesser = new BaseConsumable("/icPotionHpLesser", "Lesser Healing Potion", [
		new HealEffect("1d6")
	])
}