import {BaseItem} from "../BaseItem";
import {ItemEffect} from "../ItemEffect";
import {ConsumableComponent} from "./ConsumableComponent";

export class BaseConsumable extends BaseItem {

	constructor(resId: string,
	            name: string,
	            effects: ItemEffect[]) {
		super(resId, name);
		new ConsumableComponent(this, effects);
	}
}

