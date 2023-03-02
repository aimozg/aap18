import {Item} from "../../../../engine/objects/Item";
import {ItemProperty} from "../../../../engine/objects/ItemProperty";

export class IPDamageIncrease extends ItemProperty {
	constructor(public readonly bonus: number) {
		super();
	}

	readonly name = `${this.bonus.signed()} Damage`

	onAdd(item: Item) {
		let w = item.asWeapon;
		if (!w) return;
		w.primaryAttack.damage = w.primaryAttack.damage.withBonus(this.bonus);
	}

	onRemove(item: Item) {
		let w = item.asWeapon;
		if (!w) return;
		w.primaryAttack.damage = w.primaryAttack.damage.withBonus(-this.bonus);
	}

	clone() {
		return new IPDamageIncrease(this.bonus);
	}

}
