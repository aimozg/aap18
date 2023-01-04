import {TextIcon} from "./CreatureCondition";
import {Creature} from "../Creature";
import {Buff, StaticBuffs} from "./stats/BuffableStat";
import {substitutePattern} from "../../utils/string";
import {LogManager} from "../../logging/LogManager";

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

let logger = LogManager.loggerFor("engine.objects.creature.StatusEffect");

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
			options.description ?? "{buffs}",
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
			"power": this.power,
			"buffs": this.currentBuffs.map(b=>`${b.stat.name}\xA0${b.value.signed()}`).join(", ")
		})
	}
	get icon():TextIcon { return this.type.icon }
	currentBuffs:Buff[] = [];

	onAdd() {
		if (this.buffs) {
			this.currentBuffs.push(...this.host.ctrl.addBuffs(this.buffs, this.type.resId, this.name));
		}
		this.type.onAdd?.(this);
	}

	onRemove() {
		for (let buff of this.currentBuffs) buff.remove();
		this.currentBuffs = [];
		this.type.onRemove?.(this);
	}
}

