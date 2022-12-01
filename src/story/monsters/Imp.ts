import {Character} from "../../engine/objects/creature/Character";
import {RacialGroups} from "../../game/data/racialGroups";
import {Game} from "../../engine/Game";
import {TinyFireBolt} from "./abilities/TinyFireBolt";
import {LootTable, setupLoot} from "../../engine/objects/Loot";
import {ConsumableLib} from "../../game/data/items/ConsumableLib";

export class Imp extends Character {
	static ImpLootTable:LootTable = {
		variants: [{
			money: [5,15],
			items: [{
				chance: 0.5,
				base: ConsumableLib.PotionHealingLesser
			}]
		}]
	}
	constructor() {
		super();

		this.rgroup = RacialGroups.DEMON;
		this.name = "imp";

		this.stats.level = 1;
		this.stats.naturalAttrs = [
			4, 5, 4, 6,
			5, 3, 3, 3
		];
		this.stats.baseHpPerLevel = 5;
		this.stats.baseEpPerLevel = 5;
		this.stats.baseLpMax = 25;

		this.body.eyes.color = Game.instance.data.colorByName("red", "eyes");
		this.setSex('m');
		// TODO set imp body parts

		this.abilities.push(TinyFireBolt);

		setupLoot(this, Imp.ImpLootTable);

		this.updateStats();
	}
}
