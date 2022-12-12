/*
 * Created by aimozg on 10.07.2022.
 */
import {TAttribute} from "../rules/TAttribute";
import {defaultGender, SEX_NONE, TGender, TSex} from "../rules/gender";
import {IPronouns, Pronouns} from "../../game/data/text/gender";
import {NaturalWeaponLib} from "../../game/data/items/NaturalWeaponLib";
import {RacialGroup} from "../rules/RacialGroup";
import {Game} from "../Game";
import {Item} from "./Item";
import {TraitType} from "../rules/TraitType";
import {DefaultMonsterAI, MonsterAI} from "./MonsterAI";
import {AbstractCombatAbility} from "../combat/AbstractCombatAbility";
import {GOCreature} from "../combat/BattleGrid";
import {Inventory} from "./Inventory";
import {MaxLevel, XpPerLevel} from "../../game/xp";
import {Loot} from "./Loot";
import {CreatureCondition} from "./creature/CreatureCondition";
import {Skill} from "./creature/Skill";
import {CreatureController} from "../rules/CreatureController";
import {CreatureStats} from "./creature/CreatureStats";
import {StatusEffect, StatusEffectType} from "./creature/StatusEffect";
import {BuffableStat, BuffableStatId} from "./creature/stats/BuffableStat";
import {obj2map} from "../utils/collections";
import {PartialRecord} from "../utils/types";
import {CreatureSkill} from "./creature/stats/CreatureSkill";

export class CreatureTexts {
	constructor(public readonly creature: Creature) {}

	get race():string {
		return this.creature.rgroup.name.toLowerCase();
	}
	get sex():string {
		switch (this.creature.sex) {
			case "n": return "sexless";
			case "m": return "male";
			case "f": return "female";
			case "h": return "futanari";
		}
	}
}

// TODO this could be handled better...
export const AttributeToBuffableStat:Record<TAttribute,BuffableStatId> = {
	[TAttribute.STR]: "STR",
	[TAttribute.DEX]: "DEX",
	[TAttribute.CON]: "CON",
	[TAttribute.SPE]: "SPE",
	[TAttribute.PER]: "PER",
	[TAttribute.INT]: "INT",
	[TAttribute.WIS]: "WIS",
	[TAttribute.CHA]: "CHA",
}
export const BuffableStatToAttribute:PartialRecord<BuffableStatId,TAttribute> = {
	"STR": TAttribute.STR,
	"DEX": TAttribute.DEX,
	"CON": TAttribute.CON,
	"SPE": TAttribute.SPE,
	"PER": TAttribute.PER,
	"INT": TAttribute.INT,
	"WIS": TAttribute.WIS,
	"CHA": TAttribute.CHA,
}

export class Creature {

	//////////////////////
	// Body Stats - Data
	//////////////////////
	name: string = "Unnamed";
	protected _sex: TSex = SEX_NONE;
	get sex():TSex { return this._sex }
	genderOverride: TGender|null = null;
	get gender():TGender {
		return this.genderOverride ?? defaultGender(this.sex) // TODO futa gender is fem-dependent
	}
	rgroup: RacialGroup = Game.instance.idata.rgHumanoid;

	mf<T>(masculine:T, feminine:T):T {
		return this.gender === 'm' ? masculine : feminine;
	}
	mfx<T>(masculine:T, feminine:T, other:T):T {
		return this.gender === 'm' ? masculine : this.gender === 'f' ? feminine : other;
	}

	/////////////////////////
	// Body Stats - Helpers
	/////////////////////////
	get pronouns(): IPronouns { return Pronouns[this.gender] }
	txt = new CreatureTexts(this);

	//////////////////////
	// Main Stats - Data
	//////////////////////
	stats = new CreatureStats(this)

	get level(): number { return this.stats.level }
	get xp(): number { return this.stats.xp }
	get attrPoints(): number { return this.stats.attrPoints }
	get skillPoints(): number { return this.stats.skillPoints }

	get hp():number { return this.stats.hp }
	get hpMax():number { return this.stats.hpMax }

	get ep():number { return this.stats.ep }
	get epMax():number { return this.stats.epMax }

	get lp():number { return this.stats.lp  }
	get lpMax():number { return this.stats.lpMax }

	/////////////////////////
	// Main Stats - Helpers
	/////////////////////////

	nextLevelXp(): number {
		if (this.level >= MaxLevel) return Infinity;
		return XpPerLevel[this.level];
	}

	canLevelUp():boolean {
		return this.xp >= this.nextLevelXp();
	}

	get hpRatio():number { return this.hp/this.hpMax }

	//////////////////////
	// Attributes - Data
	//////////////////////
	// TODO move to CreatureStats
	buffableStats = obj2map<BuffableStatId, BuffableStat>({
		// TODO This could be organized better
		"STR": new BuffableStat("STR"),
		"DEX": new BuffableStat("DEX"),
		"CON": new BuffableStat("CON"),
		"SPE": new BuffableStat("SPE"),
		"PER": new BuffableStat("PER"),
		"INT": new BuffableStat("INT"),
		"WIS": new BuffableStat("WIS"),
		"CHA": new BuffableStat("CHA"),
	});

	naturalAttr(attr:TAttribute):number { return this.stats.naturalAttrs[attr] }
	get naturalLib(): number { return this.stats.naturalLib }
	get naturalPerv(): number { return this.stats.naturalPerv }
	get cor(): number { return this.stats.cor }

	/////////////////////////
	// Attributes - Helpers
	/////////////////////////

	get lib(): number { return this.ctrl.lib }
	get perv(): number { return this.ctrl.perv }

	attr(id: TAttribute): number {  return this.ctrl.attr(id) }
	attrMod(id: TAttribute): number { return this.ctrl.attrMod(id) }

	attrBuffable(id: TAttribute): BuffableStat { return this.buffableStats.get(AttributeToBuffableStat[id])!}

	/** Strength */
	get str(): number { return this.attr(TAttribute.STR) }
	/** Strength modifier */
	get strMod(): number { return this.attrMod(TAttribute.STR) }

	/** Dexterity */
	get dex(): number { return this.attr(TAttribute.DEX) }
	/** Dexterity modifier */
	get dexMod(): number { return this.attrMod(TAttribute.DEX) }

	/** Constitution */
	get con(): number { return this.attr(TAttribute.CON) }
	/** Constitution modifier */
	get conMod(): number { return this.attrMod(TAttribute.CON) }

	/** Speed */
	get spe(): number { return this.attr(TAttribute.SPE) }
	/** Perception modifier */
	get speMod(): number { return this.attrMod(TAttribute.SPE) }

	/** Perception */
	get per(): number { return this.attr(TAttribute.PER) }
	/** Perception modifier */
	get perMod(): number { return this.attrMod(TAttribute.PER) }

	/** Intellect */
	get int(): number { return this.attr(TAttribute.INT) }
	/** Intellect modifier */
	get intMod(): number { return this.attrMod(TAttribute.INT) }

	/** Wisdom */
	get wis(): number { return this.attr(TAttribute.WIS) }
	/** Wisdom modifier */
	get wisMod(): number { return this.attrMod(TAttribute.WIS) }

	/** Charisma */
	get cha(): number { return this.attr(TAttribute.CHA) }
	/** Charisma modifier */
	get chaMod(): number { return this.attrMod(TAttribute.CHA) }

	//---------------//
	// Derived Stats //
	//---------------//
	/** Universal fortitude */
	get fortitude():number { return this.ctrl.fortitude }
	/** Universal reflex saving throw */
	get reflex():number { return this.ctrl.reflex }
	/** Universal willpower saving throw */
	get willpower():number { return this.ctrl.willpower }
	/** Universal damage reduction */
	get dmgRedAll():number { return this.ctrl.dmgRedAll }

	//--------------//
	// Items - Data //
	//--------------//
	private _money: number = 0;
	get money():number { return this._money }
	set money(value:number) {
		if (!isFinite(value)) throw new Error("Attempt to set money to "+value);
		this._money = value|0;
	}

	// TODO externalize
	private _fists: Item = NaturalWeaponLib.NaturalFists.spawn();
	get fists(): Item { return this._fists }
	setFists(item:Item) { this._fists = item }

	// TODO EquipmentSlot system
	private _mainHandItem: Item|null = null;
	get mainHandItem(): Item|null { return this._mainHandItem }
	setMainHandItem(item:Item|null) { this._mainHandItem = item }

	private _bodyArmor: Item|null = null;
	get bodyArmor(): Item|null { return this._bodyArmor }
	setBodyArmor(item:Item|null) { this._bodyArmor = item }

	// TODO move inventory size to game rules
	readonly inventory: Inventory = new Inventory("Inventory", 20);

	loot: Loot = {money:0, items:[]};

	//-----------------//
	// Items - Helpers //
	//-----------------//
	get currentWeapon(): Item {
		return this.mainHandItem?.ifWeapon ?? this.fists
	}
	get meleeWeapon(): Item {
		let mw = this.mainHandItem;
		if (mw?.ifWeapon/* TODO and mw is melee weapon */) return mw;
		return this.fists;
	}
	addToInventory(item:Item) {
		this.inventory.addItem(item);
	}
	removeFromInventory(item:Item):Item|null {
		if (this.inventory.removeItem(item)) {
			return item;
		}
		return null;
	}

	///////////////////
	// Combat - Data //
	///////////////////
	/** Action Points */
	ap = 0;
	gobj: GOCreature|null = null;
	ai: MonsterAI = new DefaultMonsterAI(this);

	// TODO make these computable
	abilities: AbstractCombatAbility[] = [];
	// TODO conditions should be map to number (counter) or max-aggregated buffable stat
	conditions: Set<CreatureCondition> = new Set();
	statusEffects = new Map<StatusEffectType,StatusEffect>();

	//////////////////////
	// Combat - Helpers //
	//////////////////////
	get isAlive():boolean { return this.ctrl.isAlive }
	get canAct():boolean { return this.ctrl.canAct }
	hasCondition(condition:CreatureCondition):boolean { return this.conditions.has(condition) }
	setCondition(condition:CreatureCondition):void { this.ctrl.setCondition(condition) }
	removeCondition(condition:CreatureCondition):boolean { return this.ctrl.removeCondition(condition); }

	findStat(id:BuffableStatId):BuffableStat|undefined {
		return this.buffableStats.get(id);
	}

	findStatusEffect(type:StatusEffectType): StatusEffect|undefined { return this.statusEffects.get(type) }
	hasStatusEffect(type:StatusEffectType):boolean { return !!this.findStatusEffect(type) }
	// TODO duration
	createStatusEffect(type:StatusEffectType, power:number = 1):StatusEffect { return this.ctrl.createStatusEffect(type, power) }
	removeStatusEffect(type:StatusEffectType):boolean { return this.ctrl.removeStatusEffect(type) }

	//------------------//
	// Skills - Helpers //
	//------------------//

	skill(skill:Skill):CreatureSkill { return new CreatureSkill(this, skill) }
	skills():CreatureSkill[] { return Game.instance.data.skillList.map(skill=>this.skill(skill)) }
	natualSkillLevel(skill: Skill):number { return this.ctrl.naturalSkillLevel(skill) }
	skillLevel(skill: Skill):number { return this.ctrl.skillLevel(skill) }
	get maxNaturalSkill():number { return this.ctrl.maxNaturalSkill }
	skillXp(skill: Skill):number { return this.ctrl.skillXp(skill) }
	/** can be Infinity */
	nextSkillLevelXp(skill:Skill):number { return this.ctrl.nextSkillLevelXp(skill) }

	///////////////////
	// Traits - Data //
	///////////////////

	traits = new Set<TraitType>();

	//////////////////////
	// Traits - Helpers //
	//////////////////////

	traitList():TraitType[] {
		return Array.from(this.traits.values()).sortOn("name");
	}
	hasTrait(trait:TraitType|string):boolean {
		if (typeof trait === 'string') trait = Game.instance.data.trait(trait);
		return this.traits.has(trait);
	}
	// TODO move to CreatureController
	addTrait(trait:TraitType):void {
		this.traits.add(trait)
	}

	///////////////////
	// Other Helpers //
	///////////////////

	get rng() { return Game.instance.rng }

	////////////////////////////////////////////////////////////////////////////////
	//     METHODS
	////////////////////////////////////////////////////////////////////////////////

	constructor() {}
	public readonly ctrl = new CreatureController(this)

	updateStats() { this.ctrl.updateStats(); }
}
