import {Item} from "../objects/Item";

export namespace CommonText {
	export function armorInfo(a: Item | null): string {
		if (!a?.asArmor) return "-"
		let def = a.asArmor.defenseBonus ? "Def " + a.asArmor.defenseBonus : ""
		let dr = a.asArmor.drBonus ? "DR " + a.asArmor.drBonus : ""
		if (dr && def) return def + "/" + dr
		if (dr) return dr
		if (def) return def
		return "-"
	}

	export function weaponInfo(w: Item): string {
		return w.asWeapon?.damage?.toString() ?? "-";
	}

	export function itemInfo(i: Item): string {
		if (i.isArmor) return armorInfo(i);
		if (i.isWeapon) return weaponInfo(i);
		return "-";
	}

	export function skillDcHint(toHit: number): string {
		if (toHit <= 1) return "Trivial"           // 1
		if (toHit <= 4) return "Very Easy"         // 2 3 4
		if (toHit <= 8) return "Easy"              // 5 6 7 8
		if (toHit <= 12) return "Average"          // 9 10 11 12
		if (toHit <= 16) return "Hard"             // 13 14 15 16
		if (toHit <= 19) return "Very Hard"        // 17 18 19
		if (toHit === 20) return "Near Impossible" // 20
		return "Impossible" // 21+
	}
}
