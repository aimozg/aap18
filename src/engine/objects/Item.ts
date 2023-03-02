/*
 * Created by aimozg on 23.07.2022.
 */

import {BaseItem} from "./BaseItem";
import {WeaponComponent} from "./item/WeaponComponent";
import {ArmorComponent} from "./item/ArmorComponent";
import {ConsumableComponent} from "./item/ConsumableComponent";
import {ItemProperty} from "./ItemProperty";

export class Item {
	constructor(
		public readonly base:BaseItem
	) {}

	public customName:string|null = null;

	public get name():string { return this.customName ?? this.base.name }
	// TODO description?

	//------------//
	// Components //
	//------------//

	asWeapon: WeaponComponent | undefined;
	isWeapon: boolean;
	ifWeapon: this | null;

	asArmor: ArmorComponent | undefined;
	isArmor: boolean;
	ifArmor: this | null;

	asConsumable: ConsumableComponent | undefined;
	isConsumable: boolean;
	ifConsumable: this | null;

	//------------//
	// Properties //
	//------------//

	// TODO properly isolate
	properties: ItemProperty[] = [];
	addProperty(ip:ItemProperty) {
		this.properties.push(ip);
		ip.onAdd(this);
	}
	removeProperty(ip:ItemProperty) {
		if (this.properties.remove(ip)) {
			ip.onRemove(this);
		}
	}
}
