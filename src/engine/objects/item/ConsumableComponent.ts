import {BaseItem, BaseItemComponent, registerItemComponent} from "../BaseItem";
import {ItemEffect} from "../ItemEffect";


export class ConsumableComponent extends BaseItemComponent {
	constructor(base: BaseItem, public effects: ItemEffect[]) {
		super(base);
		if (base.consumable) throw new Error(`Cannot add ConsumableComponent to ${base}`);
		base.consumable = this;
	}
}

registerItemComponent(
	"asConsumable",
	"isConsumable",
	"ifConsumable",
	base => base.consumable
)