/*
 * Created by aimozg on 29.11.2022.
 */

import {Creature} from "../objects/Creature";
import {atMost, coerce} from "../math/utils";
import {IntParam, ValidateParams} from "../utils/decorators";
import {CreatureCondition} from "../objects/creature/CreatureCondition";
import {CoreConditions} from "../objects/creature/CoreConditions";
import {TAttribute} from "./TAttribute";
import {StatusEffect, StatusEffectType} from "../objects/creature/StatusEffect";
import {CoreStatusEffects} from "../objects/creature/CoreStatusEffects";
import {Buff, BuffableStatId} from "../objects/creature/stats/BuffableStat";
import {LogManager} from "../logging/LogManager";


export interface HornyStage {
	effect: StatusEffectType,
	threshold: number,
	seduceDC: number,
}
const HornyStages: HornyStage[] = [
	{effect: CoreStatusEffects.Horny100, threshold: 1.00, seduceDC: -40},
	{effect: CoreStatusEffects.Horny75, threshold: 0.75, seduceDC: -30},
	{effect: CoreStatusEffects.Horny50, threshold: 0.50, seduceDC: -20},
	{effect: CoreStatusEffects.Horny25, threshold: 0.25, seduceDC: -10},
];

export class CreatureController {
	constructor(public readonly creature: Creature) {
	}

	//-----------//
	// Accessors //
	//-----------//

	get stats() { return this.creature.stats }

	//----//
	// XP //
	//----//

	@ValidateParams
	setXp(@IntParam xp: number) {
		this.stats.xp = xp;
	}

	addXp(xp: number) {
		this.setXp(this.stats.xp + xp);
	}

	//------------//
	// Attributes //
	//------------//

	attr(attr: TAttribute): number {
		return this.stats.naturalAttrs[attr] + this.creature.attrBuffable(attr).value;
	}

	attrMod(attr: TAttribute): number { return this.attr(attr) - 5; }

	get str(): number { return this.attr(TAttribute.STR) }

	get strMod(): number { return this.attrMod(TAttribute.STR) }

	get dex(): number { return this.attr(TAttribute.DEX) }

	get dexMod(): number { return this.attrMod(TAttribute.DEX) }

	get con(): number { return this.attr(TAttribute.CON) }

	get conMod(): number { return this.attrMod(TAttribute.CON) }

	get spe(): number { return this.attr(TAttribute.SPE) }

	get speMod(): number { return this.attrMod(TAttribute.SPE) }

	get per(): number { return this.attr(TAttribute.PER) }

	get perMod(): number { return this.attrMod(TAttribute.PER) }

	get int(): number { return this.attr(TAttribute.INT) }

	get intMod(): number { return this.attrMod(TAttribute.INT) }

	get wis(): number { return this.attr(TAttribute.WIS) }

	get wisMod(): number { return this.attrMod(TAttribute.WIS) }

	get cha(): number { return this.attr(TAttribute.CHA) }

	get chaMod(): number { return this.attrMod(TAttribute.CHA) }

	//-----------//
	// Resources //
	//-----------//

	@ValidateParams
	setHp(@IntParam value: number) {
		// TODO animate value change
		this.stats.hp = atMost(value, this.stats.hpMax);
	}

	modHp(delta: number) {
		this.setHp(this.stats.hp + delta);
		this.updateStats();
	}

	calcHpMax(): number {
		return Math.max(1, this.stats.level * (this.stats.baseHpPerLevel + this.conMod));
	}

	@ValidateParams
	setEp(@IntParam value: number) {
		// TODO animate value change
		this.stats.ep = coerce(value, 0, this.stats.epMax);
	}

	modEp(delta: number) {
		this.setEp(this.stats.ep + delta);
		this.updateStats();
	}

	calcEpMax(): number {
		return Math.max(1, this.stats.level * (this.stats.baseEpPerLevel + this.conMod))
	}

	@ValidateParams
	setLp(@IntParam value: number) {
		// TODO animate value change
		this.stats.lp = coerce(value, 0, this.stats.lpMax);
		this.updateStats();
	}

	modLp(delta: number) {
		this.setLp(this.stats.lp + delta);
	}

	calcLpMax(): number {
		return Math.max(1, this.stats.baseLpMax);
	}

	//-----------------//
	// Secondary stats //
	//-----------------//

	get lib(): number {
		return this.stats.naturalLib + this.stats.cor
	}

	get perv(): number {
		return Math.max(this.stats.naturalPerv, this.stats.cor)
	}

	//---------------//
	// Derived stats //
	//---------------//

	/** Universal fortitude saving throw */
	get fortitude(): number {
		// TODO other sources
		return this.conMod
	}

	/** Universal reflex saving throw */
	get reflex(): number {
		// TODO other sources (base value, buffs)
		return this.dexMod
	}

	/** Universal willpower saving throw */
	get willpower(): number {
		// TODO other sources (base value, buffs)
		return this.wisMod
	}

	/** Seduction difficulty check */
	get seductionDC(): number {
		// TODO other sources (buffs)
		return 50 + this.stats.level + this.willpower + (this.hornyStage()?.seduceDC ?? 0)
	}

	/** Universal damage reduction */
	get dmgRedAll(): number {
		let value = 0;
		// TODO or natural armor
		value += this.creature.bodyArmor?.asArmor?.drBonus ?? 0;
		// TODO other sources (equipment, buffs)
		return value
	}

	get isAlive(): boolean {
		return !this.creature.hasCondition(CoreConditions.Defeated) && !this.creature.hasCondition(CoreConditions.Seduced)
	}

	/**
	 * This is a condition check, not AP check
	 */
	get canAct(): boolean {
		return this.isAlive && !this.creature.hasCondition(CoreConditions.Unaware);
	}

	//------------------//
	// Complex updaters //
	//------------------//

	setCondition(condition: CreatureCondition): void {
		logger.debug("{} setCondition({})", this.creature, condition)
		this.creature.conditions.add(condition);
	}

	removeCondition(condition: CreatureCondition): boolean {
		logger.debug("{} removeCondition({})", this.creature, condition)
		return this.creature.conditions.delete(condition);
	}

	// TODO duration, power
	createStatusEffect(type: StatusEffectType, power: number = 1): StatusEffect {
		logger.debug("{} createStatusEffect({}, {})", this.creature, type, power)
		let effect = new StatusEffect(type, this.creature, power, Object.assign({}, type.buffs));
		this.removeStatusEffect(type);
		this.creature.statusEffects.set(type, effect);
		effect.type.onAdd?.(effect);
		if (effect.buffs) {
			for (let [k, v] of Object.entries(effect.buffs)) {
				this.addStatusEffectBuff(k as BuffableStatId, v, effect);
			}
		}
		return effect;
	}

	removeStatusEffect(type: StatusEffectType): boolean {
		logger.debug("{} removeStatusEffect({})", this.creature, type)
		let effect = this.creature.statusEffects.get(type);
		if (!effect) return false;
		effect.type.onRemove?.(effect);
		effect.currentBuffs.forEach(b => b.remove());
		this.creature.statusEffects.delete(type);
		return true;
	}

	// TODO move to StatusEffect and leave only generic addBuff here?
	addStatusEffectBuff(statId: BuffableStatId, power: number, source: StatusEffect): Buff {
		logger.debug("{} addStatusEffectBuff({}, {}, {})", this.creature, statId, power, source);
		let stat = this.creature.findStat(statId);
		if (!stat) throw new Error(`Invalid BuffableStat ${statId}`);
		let buff = stat.addBuff({
			id: source.type.resId,
			value: power,
			text: source.name
		});
		source.currentBuffs.push(buff);
		return buff
	}

	updateStats() {
		logger.debug("{} updateStats()", this.creature)
		// update hp max, keep ratio
		let stats = this.stats;
		let oldHpMax = stats.hpMax;
		let newHpMax = this.calcHpMax();
		if (newHpMax !== oldHpMax) {
			if (stats.hp > 0) {
				stats.hp = coerce(1, Math.round(stats.hp * newHpMax / oldHpMax), newHpMax);
			}
			stats.hpMax = newHpMax;
		}
		// update ep max, keep ratio
		let oldEpMax = stats.epMax;
		let newEpMax = this.calcEpMax();
		if (newEpMax !== oldEpMax) {
			if (stats.ep > 0) {
				stats.ep = coerce(1, Math.round(stats.ep * newEpMax / oldEpMax), newEpMax);
			}
			stats.epMax = newEpMax;
		}
		// lp max
		let oldLpMax = stats.lpMax;
		let newLpMax = this.calcLpMax();
		if (newLpMax !== oldLpMax) {
			if (stats.lp > 0) {
				stats.lp = coerce(1, Math.round(stats.lp * newLpMax / oldLpMax), newLpMax);
			}
			stats.lpMax = newLpMax;
		}
		// conditions
		let lpratio = stats.lp / stats.lpMax;
		let currentStage = this.hornyStage()?.effect;
		let newCondition = HornyStages.find(c => lpratio >= c.threshold)?.effect;
		if (currentStage !== newCondition) {
			if (currentStage) this.removeStatusEffect(currentStage);
			if (newCondition) this.createStatusEffect(newCondition);
		}

	}

	hornyStage(): HornyStage|undefined {
		return HornyStages.find(c => this.creature.hasStatusEffect(c.effect));
	}

	recoverStats() {
		logger.debug("{} recoverStats()", this.creature)
		this.updateStats()
		this.setHp(this.creature.hpMax);
		this.setEp(this.creature.epMax);
		this.setLp(0); // TODO lpMin
	}
}

const logger = LogManager.loggerFor("engine.rules.CreatureController")
