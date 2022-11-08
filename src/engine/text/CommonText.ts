import {Item} from "../objects/Item";

export namespace CommonText {
	export function armorInfo(a:Item|null):string {
		if (!a?.asArmor) return "-"
		let def = a.asArmor.defenseBonus ? "Def "+a.asArmor.defenseBonus : ""
		let dr = a.asArmor.drBonus ? "DR "+a.asArmor.drBonus : ""
		if (dr && def) return def+"/"+dr
		if (dr) return dr
		if (def) return def
		return "-"
	}
	export function weaponInfo(w:Item):string {
		return w.asWeapon?.damage?.toString() ?? "-";
	}
	export function itemInfo(i:Item):string {
		if (i.isArmor) return armorInfo(i);
		if (i.isWeapon) return weaponInfo(i);
		return "-";
	}
}