/*
 * Created by aimozg on 29.11.2022.
 */

import {AttributeToBuffableStat, Creature} from "../objects/Creature";
import {atLeast, atMost, coerce} from "../math/utils";
import {IntParam, NonNegativeIntParam, ValidateParams} from "../utils/decorators";
import {CreatureCondition} from "../objects/creature/CreatureCondition";
import {CoreConditions} from "../objects/creature/CoreConditions";
import {TAttribute} from "./TAttribute";
import {StatusEffect, StatusEffectType} from "../objects/creature/StatusEffect";
import {CoreStatusEffects} from "../objects/creature/CoreStatusEffects";
import {Buff, BuffableStatId, StaticBuffs} from "../objects/creature/stats/BuffableStat";
import {LogManager} from "../logging/LogManager";
import {Skill} from "../objects/creature/Skill";
import {LevelRules} from "./LevelRules";
import {Game} from "../Game";
import {PerkType} from "./PerkType";
import {numberOfThings} from "../text/utils";


export interface HornyStage {
	effect: StatusEffectType,
	threshold: number,
}
const HornyStages: HornyStage[] = [
	{effect: CoreStatusEffects.Horny100, threshold: 1.00},
	{effect: CoreStatusEffects.Horny75, threshold: 0.75},
	{effect: CoreStatusEffects.Horny50, threshold: 0.50},
	{effect: CoreStatusEffects.Horny25, threshold: 0.25},
];

export class CreatureController {
	constructor(public readonly creature: Creature) {
	}

	//-----------//
	// Accessors //
	//-----------//

	get stats() { return this.creature.stats }
	get gc() { return Game.instance.gameController }

	buffableStatValue(id:BuffableStatId):number {
		let stat = this.creature.buffableStats.get(id);
		if (!stat) throw new Error(`No buffable stat ${id}`);
		return stat.value;
	}

	//----//
	// XP //
	//----//

	get level():number { return this.stats.level }

	/**
	 * Level after spending all stored XP
	 */
	get potentialLevel():number {
		let lvl = this.stats.level;
		let xp = this.stats.xp;
		while (lvl <= LevelRules.MaxLevel) {
			xp -= LevelRules.XpPerLevel[lvl];
			if (xp >= 0) {
				lvl++;
			} else {
				break;
			}
		}
		return lvl;
	}
	get nextLevelXp():number {
		if (this.level >= LevelRules.MaxLevel) return Infinity;
		return (LevelRules.XpPerLevel)[this.level];
	}
	get canLevelUp():boolean {
		return this.level < LevelRules.MaxLevel
	}
	get canLevelUpNow():boolean {
		return this.canLevelUp && this.xp >= this.nextLevelXp
	}
	get xp():number { return this.stats.xp }

	private levelUpNoticeShown = false;
	@ValidateParams
	setXp(@IntParam xp: number) {
		this.stats.xp = xp;
		if (this.canLevelUpNow) {
			if (!this.levelUpNoticeShown) {
				this.levelUpNoticeShown = true;
				this.gc.displayMessage(`${this.creature.name} has enough experience to level up.`, 'text-levelup')
				// TODO log only if for player
			}
		}
	}

	addXp(xp: number) {
		this.setXp(this.xp + xp);
	}

	//------------//
	// Attributes //
	//------------//

	attr(attr: TAttribute): number {
		return this.stats.naturalAttrs[attr] + this.buffableStatValue(AttributeToBuffableStat[attr]);
	}

	attrMod(attr: TAttribute): number { return this.attr(attr) - 5; }
	attrModNatural(attr: TAttribute): number { return this.stats.naturalAttrs[attr] - 5; }

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

	get intModNatural(): number { return this.attrModNatural(TAttribute.INT) }

	get wis(): number { return this.attr(TAttribute.WIS) }

	get wisMod(): number { return this.attrMod(TAttribute.WIS) }

	get cha(): number { return this.attr(TAttribute.CHA) }

	get chaMod(): number { return this.attrMod(TAttribute.CHA) }

	spendAttributePoint(attr:TAttribute) {
		// TODO log
		if (this.stats.attrPoints <= 0) throw new Error("No attrPoints to spend");
		this.stats.attrPoints--;
		this.stats.naturalAttrs[attr]++;
		this.updateStats();
	}

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
		return Math.max(1, this.stats.level * this.hpPerLevel() + this.buffableStatValue("hpMax"));
	}

	hpPerLevel() {
		return this.stats.baseHpPerLevel + this.conMod + this.buffableStatValue("hpMaxPerLevel");
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
		return Math.max(1, this.stats.level * this.epMaxPerLevel() + this.buffableStatValue("epMax"))
	}

	epMaxPerLevel() {
		return this.stats.baseEpPerLevel + this.conMod + this.buffableStatValue("epMaxPerLevel");
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
		return Math.max(1, this.stats.baseLpMax + this.buffableStatValue("lpMax"));
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
		return this.conMod + this.buffableStatValue("Fortitude")
	}

	/** Universal reflex saving throw */
	get reflex(): number {
		return this.dexMod + this.buffableStatValue("Reflex")
	}

	/** Universal willpower saving throw */
	get willpower(): number {
		return this.wisMod + this.buffableStatValue("Willpower")
	}

	/** Seduction difficulty check */
	get seductionDC(): number {
		return 50 + this.stats.level + this.willpower + this.buffableStatValue("SedRes")
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

	//--------//
	// Skills //
	//--------//
	naturalSkillLevel(skill:Skill):number {
		return this.stats.naturalSkills[skill.resId] ?? 0;
	}
	get maxNaturalSkill():number {
		return this.stats.level + 3;
	}
	skillLevel(skill:Skill):number {
		return this.naturalSkillLevel(skill) + (skill.attr >= 0 ? this.attrMod(skill.attr) : 0)
	}
	skillXp(skill: Skill): number {
		return this.stats.skillXp[skill.resId] ?? 0;
	}
	/** can be Infinity */
	nextSkillLevelXp(skill: Skill): number {
		let level = this.naturalSkillLevel(skill);
		if (level >= this.maxNaturalSkill) return Infinity;
		return (LevelRules.SkillXpPerLevel)[level];
	}
	spendSkillPoint(skill:Skill) {
		if (this.stats.skillPoints <= 0) throw new Error("No skillPoints to spend");
		if (this.naturalSkillLevel(skill) >= this.maxNaturalSkill) throw new Error("Skill capped");
		this.stats.skillPoints--;
		this.stats.naturalSkills[skill.resId]++;
		this.gc.displayMessage(`${skill.name} skill increased to ${this.skillLevel(skill)}`);
	}
	giveSkillXpScaled(skill: Skill, @NonNegativeIntParam base:number, @IntParam dc:number, log:boolean=true) {
		logger.debug("{} giveSkillXpScaled({}, {}, {}, {})", this.creature, skill, base, dc, log)
		this.giveSkillXp(skill, LevelRules.calcSkillXpGain(base, dc-this.skillLevel(skill)), log);
	}
	@ValidateParams
	giveSkillXp(skill:Skill, @NonNegativeIntParam amount:number, log:boolean=true) {
		logger.debug("{} giveSkillXp({}, {}, {})", this.creature, skill, amount, log)
		if (this.naturalSkillLevel(skill) >= this.maxNaturalSkill) {
			return
		}
		let xp = this.stats.skillXp[skill.resId];
		let nextXp = this.nextSkillLevelXp(skill);
		if (!isFinite(nextXp)) return;
		xp += amount;
		if (xp >= nextXp) {
			xp -= nextXp;
			this.stats.naturalSkills[skill.resId]++;
			if (log) {
				this.gc.displayMessage(`${this.creature.name}'s ${skill.name} skill increased to ${this.skillLevel(skill)}.`);
			}
		}
		this.stats.skillXp[skill.resId] = xp;
	}
	get skillPointsPerLevel(): number {
		return atLeast(LevelRules.SkillPointsGainMin, LevelRules.SkillPointsGainBase + LevelRules.SkillPointsGainPerIntMod*this.intModNatural);
	}

	//-------//
	// Perks //
	//-------//

	futurePerks(): PerkType[] {
		// TODO sort by distance/relative distance
		return this.gc.game.data.allObtainablePerks()
			.filter(p=>!this.creature.hasPerk(p));
	}
	spendPerkPoint(perk:PerkType) {
		logger.debug("{} spendPerkPoint({})", this.creature, perk);
		if (this.stats.perkPoints <= 0) throw new Error(`No perk points`);
		if (!perk.obtainableBy(this.creature)) throw new Error(`Cannot take the perk`);
		this.stats.perkPoints--;
		this.addPerk(perk);
	}
	addPerk(perk:PerkType, log:boolean=true){
		logger.debug("{} addPerk({})", this.creature, perk);
		this.creature.perks.add(perk);
		perk.onAdd(this.creature, false);
		this.updateStats();
		if (log) {
			this.gc.displayMessage(`${this.creature.name} got the ${perk.name} perk!`);
		}
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
		effect.onAdd();
		this.updateStats();
		return effect;
	}

	removeStatusEffect(type: StatusEffectType): boolean {
		logger.debug("{} removeStatusEffect({})", this.creature, type)
		let effect = this.creature.statusEffects.get(type);
		if (!effect) return false;
		effect.onRemove();
		this.creature.statusEffects.delete(type);
		this.updateStats();
		return true;
	}

	addBuff(statId: BuffableStatId, buffId:string, power: number, text: string): Buff {
		logger.debug("{} addBuff({}, {}, {}, {})", this.creature, statId, buffId, power, text);
		let stat = this.creature.findStat(statId);
		if (!stat) throw new Error(`Invalid BuffableStat ${statId}`);
		let buff = stat.addBuff({
			id: buffId,
			value: power,
			text: text,
		});
		this.updateStats();
		return buff;
	}

	addBuffs(buffs:StaticBuffs, buffId:string, text:string):Buff[] {
		return Object.entries(buffs).map(([k,v])=>this.addBuff(k as BuffableStatId, buffId, v, text));
	}
	removeBuffs(buffId:string):void {
		this.creature.buffableStats.forEach(stat=>stat.removeBuff(buffId));
	}

	// TODO called too often?
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

	levelUp() {
		logger.debug("{} levelUp()", this.creature)
		if (!this.canLevelUpNow) throw new Error("Cannot level up now");
		this.levelUpNoticeShown = false;
		let xpCost = this.nextLevelXp;
		this.stats.level++;
		this.stats.xp -= xpCost;
		let attrPointsAdd = (this.level%LevelRules.AttrPointsGainEveryNthLevel === 0) ? LevelRules.AttrPointsGain : 0;
		let skillPointsAdd = this.skillPointsPerLevel;
		let perkPointsAdd = (this.level%LevelRules.PerkPointsGainEveryNthLevel === 0) ? LevelRules.PerkPointsGain : 0;
		this.stats.attrPoints += attrPointsAdd;
		this.stats.skillPoints += skillPointsAdd;
		this.stats.perkPoints += perkPointsAdd;
		let msg = `${this.creature.name} advances to level ${this.level}!`;
		if (attrPointsAdd) msg += ' +'+numberOfThings(attrPointsAdd,'attribute point')+'.';
		if (skillPointsAdd) msg += ' +'+numberOfThings(skillPointsAdd,'skill point')+'.';
		if (perkPointsAdd) msg += ' +'+numberOfThings(perkPointsAdd,'perk point')+'.';
		if (LevelRules.ClassUpAtLevels.includes(this.level)) msg += ` New class available!`;
		this.gc.displayMessage(msg,"text-levelup")
		this.updateStats();
	}
}

const logger = LogManager.loggerFor("engine.rules.CreatureController")
