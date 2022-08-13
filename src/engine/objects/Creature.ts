/*
 * Created by aimozg on 10.07.2022.
 */
import {IGameObject} from "../GameObject";
import {TAttribute, TAttributes} from "../rules/TAttribute";
import {defaultGender, SEX_NONE, TGender, TSex} from "../rules/gender";
import {IPronouns, Pronouns} from "../../game/data/text/gender";
import {coerce} from "../math/utils";
import {NaturalWeapon} from "./item/BaseNaturalWeapon";
import {NaturalWeaponLib} from "../../game/data/items/NaturalWeaponLib";
import {AbstractWeapon} from "./item/BaseAbstractWeapon";
import {RacialGroup} from "../rules/RacialGroup";
import {Game} from "../Game";

let objectIdCounter = 0;

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

export class Creature implements IGameObject {
	objectId: string = String(objectIdCounter++);
	readonly objectType: string = "Creature";

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

	/////////////////////////
	// Body Stats - Helpers
	/////////////////////////
	get pronouns(): IPronouns { return Pronouns[this.gender] }
	txt = new CreatureTexts(this);

	//////////////////////
	// Main Stats - Data
	//////////////////////
	level: number = 1;

	private _hp: number = 1;
	get hp():number {
		this.updateStats();
		return this._hp;
	}
	set hp(value:number) {
		if (!isFinite(value)) throw new Error("HP must be finite")
		this._hp = value;
	}
	private _hpMax: number = 1;
	get hpMax():number {
		this.updateStats();
		return this._hpMax;
	}
	baseHpPerLevel: number = 10;

	private _ep:number = 1;
	get ep():number {
		this.updateStats();
		return this._ep;
	}
	set ep(value:number) {
		if (!isFinite(value)) throw new Error("EP must be finite")
		this._ep = value;
	}
	private _epMax: number = 1;
	get epMax():number {
		this.updateStats();
		return this._epMax;
	}
	baseEpPerLevel: number = 10;

	private _lp:number = 0;
	get lp():number {
		this.updateStats();
		return this._lp;
	}
	set lp(value:number) {
		if (!isFinite(value)) throw new Error("LP must be finite")
		this._lp = value;
	}
	private _lpMax: number = 1;
	get lpMax():number {
		this.updateStats();
		return this._lpMax;
	}
	baseLpMax: number = 100;

	/////////////////////////
	// Main Stats - Helpers
	/////////////////////////

	//////////////////////
	// Attributes - Data
	//////////////////////
	naturalAttrs: number[] = Array(TAttributes.length).fill(5);
	naturalLib: number = 0;
	naturalPerv: number = 0;
	cor: number = 0;

	/////////////////////////
	// Attributes - Helpers
	/////////////////////////

	get lib(): number {
		return this.naturalLib + this.cor
	}
	get perv(): number {
		return Math.max(this.naturalPerv, this.cor);
	}

	attr(id: TAttribute): number {
		return this.naturalAttrs[id];
	}
	attrMod(id: TAttribute): number { return this.attr(id) - 5 }

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

	/** Magic Affinity */
	get maf(): number { return this.attr(TAttribute.MAF) }
	/** Magic Affinity modifier */
	get mafMod(): number { return this.attrMod(TAttribute.MAF) }

	//---------------//
	// Derived Stats //
	//---------------//
	/** Universal fortitude */
	get fortitude():number {
		// TODO other sources (base value, buffs)
		return this.conMod
	}
	/** Universal reflex saving throw */
	get reflex():number {
		// TODO other sources (base value, buffs)
		return this.dexMod
	}
	/** Universal willpower saving throw */
	get will():number {
		// TODO other sources (base value, buffs)
		return this.wisMod
	}
	/** Universal damage reduction */
	get dr():number {
		// TODO other sources (equipment, buffs)
		return 0
	}

	//------------------//
	// Equipment - Data //
	//------------------//
	// TODO externalize
	private _fists: NaturalWeapon = NaturalWeaponLib.NaturalFists.spawn();
	get fists(): NaturalWeapon { return this._fists }
	setFists(item:NaturalWeapon) { this._fists = item }

	private _mainWeapon: AbstractWeapon = null;
	get mainWeapon(): AbstractWeapon { return this._mainWeapon }
	setMainWeapon(item:AbstractWeapon) { this._mainWeapon = item }

	////////////////////////
	// Equipment - Helpers
	////////////////////////
	get weapon(): AbstractWeapon {
		return this.mainWeapon ?? this.fists
	}
	get meleeWeapon(): AbstractWeapon {
		let mw = this.mainWeapon;
		if (mw /* TODO and mw is melee weapon */) return mw;
		return this.fists;
	}

	///////////////////
	// Combat - Data //
	///////////////////
	/** Action Points */
	ap = 0;

	//////////////////////
	// Combat - Helpers //
	//////////////////////
	get isAlive():boolean { return this.hp > 0 }

	////////////////////////////////////////////////////////////////////////////////
	//     METHODS
	////////////////////////////////////////////////////////////////////////////////

	constructor() {}

	updateStats() {
		// hp max
		let oldHpMax = this._hpMax;
		let newHpMax = Math.max(1, this.level * (this.baseHpPerLevel + this.conMod));
		if (newHpMax !== oldHpMax) {
			if (this._hp > 0) {
				this._hp = coerce(1, Math.round(this._hp * newHpMax / oldHpMax), newHpMax);
			}
			this._hpMax = newHpMax;
		}
		// ep max
		let oldEpMax = this._epMax;
		let newEpMax = Math.max(1, this.level * (this.baseEpPerLevel + this.conMod));
		if (newEpMax !== oldEpMax) {
			if (this._ep > 0) {
				this._ep = coerce(1, Math.round(this._ep * newEpMax / oldEpMax), newEpMax);
			}
			this._epMax = newEpMax;
		}
		// lp max
		let oldLpMax = this._lpMax;
		let newLpMax = Math.max(1, this.baseLpMax);
		if (newLpMax !== oldLpMax) {
			if (this._lp > 0) {
				this._lp = coerce(1, Math.round(this._lp * newLpMax / oldLpMax), newLpMax);
			}
			this._lpMax = newLpMax;
		}
	}
}
