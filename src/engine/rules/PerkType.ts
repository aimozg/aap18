/*
 * Created by aimozg on 27.08.2022.
 */

import Symbols from "../symbols";
import {IResource} from "../IResource";
import {Creature} from "../objects/Creature";

export abstract class PerkType implements IResource {
	readonly resType: symbol = Symbols.ResTypePerk
	protected constructor(
		public readonly resId: string
	) {}
	/* TODO parametrized perks */
	abstract name(host:Creature|null):string
	abstract description(host:Creature|null):string
}

export class SimplePerkType extends PerkType {
	constructor(resId: string, public constName:string, public constDescription: string) {
		super(resId);
	}
	name(host: Creature|null): string {
		return this.constName;
	}
	description(host: Creature|null): string {
		return this.constDescription;
	}
}
