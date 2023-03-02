/*
 * Created by aimozg on 23.07.2022.
 */

import {IResource} from "../IResource";
import Symbols from "../symbols";
import {Item} from "./Item";
import {WeaponComponent} from "./item/WeaponComponent";
import {ArmorComponent} from "./item/ArmorComponent";
import {ConsumableComponent} from "./item/ConsumableComponent";
import {ItemProperty} from "./ItemProperty";

export abstract class BaseItem implements IResource {
	get resType() { return Symbols.ResTypeBaseItem }
	protected constructor(
		public readonly resId:string,
		public name: string) { }

	spawn():Item {
		let item = new Item(this);
		for (let prop of this.properties) {
			item.addProperty(prop.clone());
		}
		return item;
	}
	readonly components: BaseItemComponent[] = [];
	readonly properties: ItemProperty[] = [];

	weapon: WeaponComponent | undefined;
	get isWeapon(): boolean { return !!this.weapon };

	armor: ArmorComponent | undefined;
	get isArmor(): boolean { return !!this.armor };

	consumable: ConsumableComponent | undefined;
	get isConsumable(): boolean { return !!this.consumable };

	withProperty(ip:ItemProperty):this {
		this.properties.push(ip);
		return this;
	}
}

export abstract class BaseItemComponent {
	protected constructor(public readonly base:BaseItem) {
		base.components.push(this);
	}
}

export function registerItemComponent<
	PROP_COMP extends keyof Item,
	PROP_IS extends keyof Item,
	PROP_IF extends keyof Item,
	COMPONENT extends Item[PROP_COMP] & BaseItemComponent
	>(propComp:PROP_COMP, propIs:PROP_IS, propIf:PROP_IF, accessor:(base:BaseItem)=>COMPONENT|undefined) {
	Object.defineProperty(Item.prototype, propComp, {
		enumerable: false,
		configurable: false,
		get(this: Item): COMPONENT|undefined {
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
		get(this: Item): Item|null {
			return accessor(this.base) ? this : null;
		}
	});
}
