/*
 * Created by aimozg on 24.07.2022.
 */
import {Random} from "./Random";

export class Dice {
	constructor(spec:string);
	constructor(
		rolls:number,
		sides:number,
		bonus?:number
	);
	constructor() {
		if (arguments.length === 1) {
			let spec = arguments[0] as string;
			let d = spec.indexOf('d');
			if (d < 0) {
				this.rolls = 0;
				this.sides = 0;
				this.bonus = parseInt(spec);
			} else {
				this.rolls = parseInt(spec.substring(0, d));
				let p = spec.indexOf('+');
				if (p < 0) p = spec.indexOf("-");
				if (p < 0) {
					this.sides = parseInt(spec.substring(d + 1));
					this.bonus = 0;
				} else {
					this.sides = parseInt(spec.substring(d + 1, p));
					this.bonus = parseInt(spec.substring(p));
				}
			}
		} else {
			this.rolls = arguments[0]|0;
			this.sides = arguments[1]|0;
			this.bonus = arguments[2]|0;
		}
	}
	toString() {
		const {rolls,sides,bonus} = this;
		if (rolls === 0 || sides === 0) return String(bonus);
		let s = ""+rolls+"d"+sides;
		if (bonus > 0) s += "+"+bonus;
		else if (bonus < 0) s += bonus;
		return s;
	}

	public readonly rolls:number;
	public readonly sides:number;
	public readonly bonus:number;

	roll(rng:Random):number {
		return rng.dice(this.rolls, this.sides)+this.bonus;
	}
	inverse():Dice {
		return new Dice(-this.rolls,this.sides,-this.bonus)
	}
	repeat(n:number):Dice {
		if (n === 0) return Dices.ZERO
		if (n === 1) return this
		return new Dice(this.rolls*n, this.sides, this.bonus*n)
	}
}

let lib = new Map<string,Dice>();

export function dice(spec:string):Dice {
	if (lib.has(spec)) return lib.get(spec);
	let dice = new Dice(spec);
	if (dice.bonus === 0) lib.set(spec, dice);
	return dice;
}

export const Dices = {
	ZERO: dice("0"),
	x1d2: dice("1d2"),
	x1d3: dice("1d3"),
	x1d4: dice("1d4"),
	x1d6: dice("1d6"),
	x2d6: dice("2d6"),
	x3d6: dice("3d6"),
	x4d6: dice("4d6"),
	x5d6: dice("5d6"),
	x6d6: dice("6d6"),
	x1d8: dice("1d8"),
	x1d10: dice("1d10"),
	x1d12: dice("1d12"),
	x1d20: dice("1d20"),
	x1d100: dice("1d100"),
};
