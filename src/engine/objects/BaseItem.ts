/*
 * Created by aimozg on 23.07.2022.
 */

import {IResource} from "../IResource";
import Symbols from "../symbols";
import {Item} from "./Item";

export abstract class BaseItem<out ITEM extends Item> implements IResource {
	get resType() { return Symbols.ResTypeBaseItem }
	protected constructor(
		public readonly resId:string,
		public name: string) { }

	abstract spawn():ITEM
	readonly components: BaseItemComponent[] = [];
}

export abstract class BaseItemComponent {
	protected constructor(public readonly base:BaseItem<any>) {
		base.components.push(this);
	}
}

export function registerItemComponent<
	PROP_COMP extends keyof Item,
	PROP_IS extends keyof Item,
	PROP_IF extends keyof Item,
	COMPONENT extends Item[PROP_COMP] & BaseItemComponent
	>(propComp:PROP_COMP, propIs:PROP_IS, propIf:PROP_IF, accessor:(base:BaseItem<any>)=>COMPONENT) {
	Object.defineProperty(Item.prototype, propComp, {
		enumerable: false,
		configurable: false,
		get(this: Item): COMPONENT {
			return accessor(this.base)
		}
	});
	Object.defineProperty(Item.prototype, propIs, {
		enumerable: false,
		configurable: false,
		get(this: Item): boolean {
			return !!accessor(this.base)
		}
	});
	Object.defineProperty(Item.prototype, propIf, {
		enumerable: false,
		configurable: false,
		get(this: Item): Item {
			return accessor(this.base) ? this : null;
		}
	});
}
