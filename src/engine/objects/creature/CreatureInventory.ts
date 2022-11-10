import {Inventory} from "../Inventory";
import {Creature} from "../Creature";

export class CreatureInventory extends Inventory {
	constructor(readonly creature:Creature, size: number) {
		super("", size);
	}

	get name():string {
		return super.name || `${this.creature.name}'s items`
	}
}