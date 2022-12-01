import {TextIcon} from "./CreatureCondition";
import {Creature} from "../Creature";
import {Buff, StaticBuffs} from "./stats/BuffableStat";
import {substitutePattern} from "../../utils/string";

export interface StatusEffectOptions {
	id: string;
	name: string;
	icon: TextIcon;
	description?: string;
	onAdd?: (e:StatusEffect)=>void;
	onUpdate?: (e:StatusEffect)=>void;
	onRemove?: (e:StatusEffect)=>void;

	buffs?: StaticBuffs;
}

export class StatusEffectType {
	constructor(
		public resId: string,
		public name: string,
		public icon: TextIcon,
		public descriptionPattern: string,
		public onAdd?: (e:StatusEffect)=>void,
		public onUpdate?: (e:StatusEffect)=>void,
		public onRemove?: (e:StatusEffect)=>void,
		public buffs?: StaticBuffs
	) {}

	static build(options:StatusEffectOptions):StatusEffectType {
		return new StatusEffectType(
			options.id,
			options.name,
			options.icon,
			options.description ?? "",
			options.onAdd,
			options.onUpdate,
			options.onRemove,
			options.buffs
		)
	}
}

export class StatusEffect {
	constructor(
		public readonly type: StatusEffectType,
		public readonly host: Creature,
		public power:number,
		// TODO duration
		public buffs:StaticBuffs,
	) {}

	get name() { return this.type.name }
	get description():string {
		return substitutePattern(this.type.descriptionPattern, {
			// TODO duration
			"power": this.power
		})
	}
	get icon():TextIcon { return this.type.icon }
	currentBuffs:Buff[]|null = null;
}

