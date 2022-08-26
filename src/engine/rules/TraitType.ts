/*
 * Created by aimozg on 27.08.2022.
 */

import Symbols from "../symbols";
import {IResource} from "../IResource";
import {Creature} from "../objects/Creature";

export abstract class TraitType implements IResource {
	readonly resType: symbol = Symbols.ResTypeTrait
	protected constructor(
		public readonly resId: string
	) {}
	/* TODO parametrized traits */
	abstract name(host:Creature|null):string
	abstract description(host:Creature|null):string
}

export class SimpleTraitType extends TraitType {
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
