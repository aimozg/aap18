import {Item} from "./Item";

export class Inventory {
	constructor(
		name: string,
		size: number
	) {
		this._name = name;
		this.slots = [];
		this.addSlots(size);
	}
	toString():string { return `[Inventory "${this.name}"(${this.size})]`}

	get name(): string { return this._name; }
	set name(value: string) { this._name = value; }
	private _name: string;

	readonly slots: (Item | null)[];
	get size(): number { return this.slots.length; 	}

	addSlots(n: number) {
		while (n-- > 0) {
			this.slots.push(null);
		}
	}

	get items(): Item[] {
		return this.slots.filter(i => !!i) as Item[];
	}

	emptySlot(): number {
		return this.slots.findIndex(i => !i);
	}
	emptySlotCount():number {
		return this.slots.count(i => !i);
	}

	canTake(item:Item):boolean {
		// TODO stacking
		return this.emptySlot() >= 0;
	}
	canTakeAll(items:Item[]):boolean {
		// TODO stacking
		return this.emptySlotCount() >= items.length;
	}

	addItem(item: Item): boolean {
		if (this.includes(item)) throw new Error(`Item ${item} already in ${this}`)
		let es = this.emptySlot(); // TODO stacking
		if (es < 0) return false;
		this.slots[es] = item;
		return true;
	}

	/**
	 * Add multiple items to this inventory
	 * @param items
	 * @return Leftover items
	 */
	addAll(items:Item[]):Item[] {
		let miss = [];
		for (let item of items) {
			if (!this.addItem(item)) miss.push(item);
		}
		return miss;
	}

	removeItem(item: Item): boolean {
		let idx = this.slots.indexOf(item);
		if (idx < 0) return false;
		this.slots[idx] = null;
		return true;
	}

	transferTo(item:Item, target:Inventory):boolean {
		let i = this.indexOf(item);
		if (i < 0) throw new Error(`Cannot transfer ${item}, not in ${this}`);
		if (target.addItem(item)) {
			this.slots[i] = null;
			return true;
		}
		return false;
	}

	includes(item: Item | null): boolean {
		return this.slots.includes(item);
	}

	indexOf(item: Item | null): number {
		return this.slots.indexOf(item);
	}

	filter(predicate: (item: Item | null, index: number, array: (Item | null)[]) => boolean, thisArg?: any): (Item | null)[] {
		return this.slots.filter(predicate, thisArg);
	}

	map<O>(callback: (item: Item | null, index: number, array: (Item | null)[]) => O, thisArg?: any): O[] {
		return this.slots.map(callback, thisArg);
	}

	static wrap(items: Item[], name: string = "Items"): Inventory {
		let inv = new Inventory(name, 0);
		inv.slots.push(...items);
		return inv;
	}
}