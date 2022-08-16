/*
 * Created by aimozg on 14.08.2022.
 */

import {BaseItem, BaseItemComponent, registerItemComponent} from "../BaseItem";
import {IResource} from "../../IResource";

declare module "../BaseItem" {
	export interface BaseItem extends IResource {
		armor: ArmorComponent | undefined;
		isArmor: boolean;
	}
}
declare module "../Item" {
	export interface Item {
		asArmor: ArmorComponent | undefined;
		isArmor: boolean;
		ifArmor: this | null;
	}
}

export class ArmorComponent extends BaseItemComponent {

	constructor(base: BaseItem, public defenseBonus:number, public drBonus:number) {
		super(base);
		if (base.armor) throw new Error("Cannot add ArmorComponent to "+base);
		base.armor = this;
	}
}

registerItemComponent(
	"asArmor",
	"isArmor",
	"ifArmor",
	base => base.armor
);
