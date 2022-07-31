/*
 * Created by aimozg on 17.07.2022.
 */
import {IResource} from "./IResource";

export class ResLib<R extends IResource> {
	private readonly map = new Map<string,R>();

	constructor(
		public readonly resType: Symbol,
		public readonly displayName: string
	) {}

	get(resId:string):R {
		let x = this.map.get(resId);
		if (x === undefined) throw new Error(`Missing ${this.displayName} '${resId}'`);
		return x;
	}
	getOrNull(resId:string):R|null {
		return this.map.get(resId)??null;
	}

	register(res:R, overwrite:boolean = false) {
		let id = res.resId;
		if (res.resType !== this.resType) throw new Error(`Invalid ${this.displayName} '${id}' type ${res.resType}, expected ${this.resType}`);
		if (this.map.has(id) && !overwrite) throw new Error(`Duplicate ${this.displayName} '${id}'`)
		this.map.set(id, res);
	}

	registerMany(resources:R[], overwrite:boolean = false) {
		for (let res of resources) this.register(res, overwrite);
	}

	clear() {
		this.map.clear();
	}

	keys(): string[] {
		return Array.from(this.map.keys());
	}
	values(): R[] {
		return Array.from(this.map.values());
	}
	entries(): [string, R][] {
		return Array.from(this.map.entries());
	}
}
