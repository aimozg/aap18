import {Creature} from "../Creature";
import {TAttribute, TAttributes} from "../../rules/TAttribute";
import {createRecord} from "../../utils/collections";
import {Game} from "../../Game";

export class CreatureStats {

	constructor(public readonly creature: Creature) {
	}

	//------//
	// Core //
	//------//

	level: number = 1;
	xp: number = 0;

	attrPoints: number = 0;
	skillPoints: number = 0;
	perkPoints: number = 0;

	//-----------//
	// Resources //
	//-----------//

	hp: number = 1;
	hpMax: number = 1;
	baseHpPerLevel: number = 10;

	ep: number = 0;
	epMax: number = 0;
	baseEpPerLevel: number = 10;

	lp: number = 0;
	lpMax: number = 1;
	baseLpMax: number = 100;

	//------------//
	// Attributes //
	//------------//

	naturalAttrs: number[] = Array(TAttributes.length).fill(5);

	get naturalStr() { return this.naturalAttrs[TAttribute.STR]; }
	get naturalDex() { return this.naturalAttrs[TAttribute.DEX]; }
	get naturalCon() { return this.naturalAttrs[TAttribute.CON]; }
	get naturalSpe() { return this.naturalAttrs[TAttribute.SPE]; }
	get naturalPer() { return this.naturalAttrs[TAttribute.PER]; }
	get naturalInt() { return this.naturalAttrs[TAttribute.INT]; }
	get naturalWis() { return this.naturalAttrs[TAttribute.WIS]; }
	get naturalCha() { return this.naturalAttrs[TAttribute.CHA]; }

	//-----------------//
	// Secondary stats //
	//-----------------//

	naturalLib: number = 0;
	naturalPerv: number = 0;
	cor: number = 0;

	//--------//
	// Skills //
	//--------//

	naturalSkills: Record<string,number> = createRecord(Game.instance.data.skills.keys().map(id=>[id,0]));
	skillXp: Record<string,number> = createRecord(Game.instance.data.skills.keys().map(id=>[id,0]));
}
