import {BaseItem} from "../BaseItem";
import {ArmorComponent} from "./ArmorComponent";

export class BaseBodyArmor extends BaseItem {

	constructor(resId: string, name: string, defenseBonus: number, drBonus: number) {
		super(resId, name);
		new ArmorComponent(this, defenseBonus, drBonus);
	}
}
