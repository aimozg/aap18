import {Creature} from "./Creature";
import {GameController} from "../GameController";
import {TextOutput} from "../text/output/TextOutput";

export abstract class ItemEffect {
	protected constructor(public name: string) {
	}

	abstract apply(gc: GameController, creature: Creature, output?: TextOutput): Promise<void>;
}