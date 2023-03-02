import {Item} from "./Item";
import {Random} from "../math/Random";
import {BaseItem} from "./BaseItem";
import {dice} from "../math/Dice";
import {Creature} from "./Creature";

// TODO this needs to be reworked:
//  - external item lists
//  - item generators

export interface LootTable {
	variants: LootTableEntry[];
}
export interface LootTableEntry {
	weight?: number;
	/** Dice spec, const value, or [min,max] default 0 */
	money?: string|[number,number]|number;
	items?: LootTableItem[];
}
export interface LootTableItem {
	base: BaseItem;
	/** 0..1, default 1 */
	chance?: number;
	/** Dice spec or const value, or [min,max] default 1*/
	quantity?: string|[number,number]|number;
}
export interface Loot {
	money: number;
	items: Item[];
}

function diceOrConst(rng:Random, spec:string|number|[number,number]|undefined, defaultValue:number):number {
	if (spec === undefined) return defaultValue;
	if (typeof spec === 'string') return dice(spec).roll(rng);
	if (Array.isArray(spec)) return rng.nextInt(spec[0], spec[1] + 1);
	return spec;
}

export function generateLoot(rng:Random, table:LootTable):Loot {
	let entry = rng.pickWeightedOrNull(table.variants, entry => entry.weight ?? 1);
	if (!entry) return {money:0,items:[]};

	let money = diceOrConst(rng, entry.money, 0);
	if (money < 0) money = 0;

	let items:Item[] = [];
	for (let litem of entry.items ?? []) {
		if (!rng.nextBoolean(litem.chance ?? 1)) continue;
		// TODO item quantity
		let quantity = diceOrConst(rng, litem.quantity, 1);
		items.push(litem.base.spawn());
	}

	return {
		money,
		items
	}
}

/**
 * Merges Loot objects into source[0] (the object is modified)
 * @return source[0]
 */
export function mergeLoot(source:Loot[]):Loot {
	if (source.length === 0) return {money:0,items:[]};
	let target = source[0];
	for (let i = 1; i < source.length; i++) {
		let loot = source[i];
		target.money += loot.money;
		target.items.push(...loot.items);
	}
	return target;
}

export function setupLoot(creature: Creature, table: LootTable, rng: Random = creature.rng) {
	creature.loot = generateLoot(rng, table);
	/*
	TODO alternative to loot variable - adding items to the creature inventory
	let loot = generateLoot(rng, table);
	creature.money += loot.money;
	creature.inventory.ensureEmptySlots(loot.items.length);
	for (let item of loot.items) {
		creature.inventory.addItem(item);
	}

	 */
}
