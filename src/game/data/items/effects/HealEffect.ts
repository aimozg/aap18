import {ItemEffect} from "../../../../engine/objects/ItemEffect";
import {GameController} from "../../../../engine/GameController";
import {Creature} from "../../../../engine/objects/Creature";
import {TextOutput} from "../../../../engine/text/output/TextOutput";
import {dice, Dice} from "../../../../engine/math/Dice";

export class HealEffect extends ItemEffect {

	public power: Dice;

	constructor(power: Dice | string) {
		if (typeof power === "string") power = dice(power);
		super("Heal " + power);
		this.power = power;
	}

	async apply(gc: GameController, creature: Creature, output?: TextOutput): Promise<void> {
		let amount = this.power.roll(gc.rng);
		await gc.restoreHp(creature, amount, output);
	}
}