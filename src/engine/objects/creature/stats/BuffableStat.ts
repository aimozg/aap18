/*
 * Created by aimozg on 26.11.2022.
 */

import {ReadonlyRecord} from "../../../utils/types";
import {coerce} from "../../../math/utils";

export interface SoftEnumBuffableStatIds {
	STR: 1,
	DEX: 1,
	CON: 1,
	SPE: 1,
	PER: 1,
	INT: 1,
	WIS: 1,
	CHA: 1,
}
export type BuffableStatId = keyof SoftEnumBuffableStatIds;
export type StaticBuffs = {
	// TODO after TypeScript 4.4 [index:BuffableStatId] should work as well
	[index in BuffableStatId]?: number
}

export enum AggregateType {
	SUM,
	MUL,
	MIN,
	MAX
}

const Reductors: ReadonlyRecord<AggregateType, (a:number,b:number)=>number> = Object.freeze({
	[AggregateType.SUM](a: number, b: number): number {
		return a+b;
	},
	[AggregateType.MUL](a: number, b: number): number {
		return a*b;
	},
	[AggregateType.MIN](a: number, b: number): number {
		return Math.min(a,b);
	},
	[AggregateType.MAX](a: number, b: number): number {
		return Math.max(a,b);
	}
})

export interface BuffableStatOptions {
	name: string;
	base: number;
	aggregate: AggregateType;
	min: number;
	max: number;
}

export class Buff {
	get value(): number {
		return this._value;
	}

	set value(value: number) {
		this._value = value;
		this.stat.invalidate();
	}
	private _value: number;

	constructor(
		public readonly stat: BuffableStat,
		public readonly id: string,
		value: number,
		public text: string
	) { this._value = value; }

	remove(): boolean {
		return this.stat.removeBuff(this.id);
	}
}

export interface BuffOptions {
	id: string;
	value: number;
	text: string;
}

export class BuffableStat {

	constructor(
		public readonly id: string,
		options?: Partial<BuffableStatOptions>
	) {
		const aggregate = options?.aggregate ?? AggregateType.SUM;
		this.options = Object.assign({
			name: id,
			base: {
				[AggregateType.SUM]: 0,
				[AggregateType.MUL]: 1,
				[AggregateType.MIN]: +Infinity,
				[AggregateType.MAX]: -Infinity,
			}[aggregate],
			aggregate: aggregate,
			min: -Infinity,
			max: +Infinity
		}, options)
	}
	readonly options: Readonly<BuffableStatOptions>
	get name(): string { return this.options.name }
	readonly buffs: Buff[] = [];

	get min(): number { return this.options.min }
	get max(): number { return this.options.max }
	private _value = 0
	private _dirty = true
	get value(): number {
		if (this._dirty) this.compute();
		return this._value;
	}
	invalidate() {
		this._dirty = true
	}
	private compute() {
		let value = this.options.base;
		let reductor = Reductors[this.options.aggregate];
		for (let buff of this.buffs) {
			value = reductor(value, buff.value);
		}
		this._dirty = false;
		this._value = value;
	}

	private findBuffIndex(id:string):number {
		return this.buffs.findIndex(b=>b.id === id);
	}
	findBuff(id:string):Buff|undefined {
		return this.buffs.find(b=>b.id === id);
	}
	removeBuff(id:string):boolean {
		let i = this.findBuffIndex(id);
		if (i < 0) return false;
		this.buffs.splice(i, 1);
		this.invalidate();
		return true;
	}
	removeAllBuffs():void {
		this.buffs.splice(0);
		this.invalidate();
	}
	addBuff(options:BuffOptions, ifExists:'error'|'replace'|'add'|'skip' ='error'): Buff {
		let index = this.findBuffIndex(options.id);
		// TODO stackable buffs?
		let buff: Buff;
		if (index >= 0) {
			if (ifExists === 'error') {
				throw new Error(`Buff ${options.id} already exists`)
			} else if (ifExists === 'replace') {
				this.buffs[index] = new Buff(this, options.id, options.value, options.text);
			} else if (ifExists === 'add') {
				this.buffs[index].value += options.value;
			} else if (ifExists === 'skip') {
				/* do nothing */
			}
			buff = this.buffs[index];
		} else {
			buff = new Buff(this, options.id, options.value, options.text);
			this.buffs.push(buff);
		}
		this.invalidate();
		return buff;
	}
	modBuff(id:string, delta:number, min:number=-Infinity, max:number=+Infinity):number {
		let existing = this.findBuff(id);
		if (!existing) return this.options.base;
		existing.value = coerce(existing.value + delta, min, max);
		this.invalidate();
		return existing.value
	}
	incBuff(id:string, delta:number, max:number=+Infinity, deleteAtMax:boolean=false) {
		let newValue = this.modBuff(id, delta, -Infinity, max);
		if (deleteAtMax && newValue >= max) this.removeBuff(id);
	}
	decBuff(id:string, delta:number, min:number=-Infinity, deleteAtMin:boolean=false) {
		let newValue = this.modBuff(id, delta, min, +Infinity);
		if (deleteAtMin && newValue <= min) this.removeBuff(id);
	}
}
