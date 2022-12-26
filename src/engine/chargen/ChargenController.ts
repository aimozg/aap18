/*
 * Created by aimozg on 14.07.2022.
 */

import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {ChargenRules} from "../../game/ChargenRules";
import {TAttribute, TAttributes} from "../rules/TAttribute";
import fxrng from "../math/fxrng";
import {defaultGender, TSex} from "../rules/gender";
import {NewGameScreen} from "./NewGameScreen";
import {CharacterBody} from "../objects/creature/Character";
import {BreastSizeTier, BreastSizeTiers} from "../../game/data/body/Breasts";
import {randomName} from "../../game/data/text/names";
import {ButtonMenuItem} from "../ui/components/ButtonMenu";
import {Color} from "../objects/Color";
import {HumanEyeColorNames, HumanHairColorNames, HumanSkinColorNames} from "../../game/data/colors";
import {Game} from "../Game";
import {IStatMetadata, StatMetadata} from "../../game/data/stats";
import {CharacterClass} from "../rules/classes/CharacterClass";
import {PenisSizeTier, PenisSizeTiers} from "../../game/data/body/Penis";
import {GdStartingPerks} from "../../game/data/./perks/starting";
import {PerkType} from "../rules/PerkType";
import {Skill} from "../objects/creature/Skill";

interface IChargenSecondaryStat {
	key: keyof ChargenController;
	total: number;
	natural: number;
	min: number;
	max: number;
	meta: IStatMetadata;
}

export class ChargenController {

	constructor(private readonly screen: NewGameScreen) {
		this.reset()
	}

	///////////
	// Rules //
	///////////
	futanariAllowed(): boolean {
		return this.origin === "native";
	}
	allowedRaces(): ButtonMenuItem<string>[] {
		// TODO list actual races from somewhere
		return [{
			label: "Human",
			value: 'human'
		}, {
			label: 'Elf',
			value: 'elf',
			disabled: true
		}, {
			label: 'Half-cat',
			value: 'half-cat',
			disabled: true
		}, {
			label: 'Cat-morph',
			value: 'beast-cat',
			disabled: true
		}, {
			label: 'Half-wolf',
			value: 'half-wolf',
			disabled: true
		}, {
			label: 'Wolf-morph',
			value: 'beast-wolf',
			disabled: true
		}, {
			label: 'Half-fox',
			value: 'half-fox',
			disabled: true
		}, {
			label: 'Fox-morph',
			value: 'beast-fox',
			disabled: true
		}]
	}
	allowedHairColors(): Color[] {
		// TODO race-dependent
		return Game.instance.data.colorsByNames(HumanHairColorNames, "hair");
	}
	allowedEyeColors(): Color[] {
		// TODO race-dependent
		return Game.instance.data.colorsByNames(HumanEyeColorNames, "eyes");
	}
	allowedSkinColors(): Color[] {
		// TODO race-dependent
		return Game.instance.data.colorsByNames(HumanSkinColorNames, "skin");
	}
	minBreastSize():number {
		return this.sex === 'm' ? BreastSizeTiers.FLAT.value : ChargenRules.breastsMinFemale;
	}
	maxBreastSize():number {
		return this.sex === 'm' ? ChargenRules.breastsMaxMale : ChargenRules.breastsMaxFemale;
	}
	allowedBreastSizes(): ButtonMenuItem<number>[] {
		let min = this.minBreastSize();
		let max = this.maxBreastSize();
		return BreastSizeTier.list().map(bst => ({
			label: bst.name,
			value: bst.value,
			disabled: bst.value < min || bst.value > max
		}))
	}
	minPenisSize():number {
		return this.body.penis.isPresent ? ChargenRules.penisMin : PenisSizeTiers.NONE.value;
	}
	maxPenisSize():number {
		return this.body.penis.isPresent ? ChargenRules.penisMax : PenisSizeTiers.NONE.value;
	}
	allowedPenisSizes(): ButtonMenuItem<number>[] {
		let min = this.minPenisSize();
		let max = this.maxPenisSize();
		return PenisSizeTier.list().map(pst => ({
			label: pst.name,
			value:pst.value,
			disabled: !this.body.penis.isPresent || pst.value < min || pst.value > max
		}))
	}
	secondaryStats(): IChargenSecondaryStat[] {
		return [{
			key: "lib",
			total: this.player.lib,
			natural: this.player.naturalLib,
			min: ChargenRules.minLib,
			max: ChargenRules.maxLib,
			meta: StatMetadata.lib
		}, {
			key: "perv",
			total: this.player.perv,
			natural: this.player.naturalPerv,
			min: ChargenRules.minPerv,
			max: ChargenRules.maxPerv,
			meta: StatMetadata.perv
		}, {
			key: "cor",
			total: this.player.cor,
			natural: this.player.cor,
			min: ChargenRules.minCor,
			max: ChargenRules.maxCor,
			meta: StatMetadata.cor
		}]
	}
	allowedSkills(): Skill[] {
		return Game.instance.data.skillList;
	}
	skillMax(skill: Skill): number {
		// TODO affected by class?
		return ChargenRules.skillMax;
	}
	skillPointsTotal():number {
		return ChargenRules.skillPoints + Math.max(0, this.attrMod(TAttribute.INT)) * ChargenRules.skillPointsPerIntMod;
	}
	getUpgradeableSkills() {
		return this.allowedSkills().filter(skill => this.canIncSkill(skill));
	}
	allowedPerks(withNone:boolean=true): ButtonMenuItem<string | null>[] {
		let list: ButtonMenuItem<string|null>[] = GdStartingPerks.ALL.map(t=>({
			label: t.name(null),
			value: t.resId
		})).sortOn("label");
		if (withNone) list.unshift({
			label: "(None)",
			value: null
		});
		return list;
	}

	//////////
	// Data //
	//////////

	player: PlayerCharacter;
	private internalUpdate = false;
	// Origin
	origin: string | null;
	// Identity
	sex: TSex;
	name: string;
	race: string;
	// Appearance
	body: CharacterBody;
	// Class
	cclass: string | null;
	// Attributes
	attrPoints: number;
	attrs: number[];
	// Stats
	lib: number;
	perv: number;
	cor: number;
	// Skills
	skillPointsSpent: number;
	skills: Record<string,number> = {};
	// Perks
	perk: string|null; // TODO allow multiple perks in chargen

	/////////////
	// Setters //
	/////////////

	setOrigin(originId: string|null) {
		this.origin = originId;
		this.internalUpdate = true;
		if (this.sex === 'h' && !this.futanariAllowed()) {
			this.setSex('f');
		}
		// TODO clear race if not allowed
		this.internalUpdate = false;
		this.update()
	}
	setName(name: string) {
		this.name = name;
		this.update()
	}
	setRandomName() {
		this.name = randomName(defaultGender(this.sex))
		this.update()
	}
	setSex(sex: TSex) {
		this.sex = sex;
		this.body.setSex(sex);
		this.body.breasts.size = sex === 'm' ? BreastSizeTiers.FLAT.value : fxrng.nextInt(ChargenRules.breastsMinFemale, ChargenRules.breastsMaxFemale + 1);
		if (this.body.penis.isPresent) {
			this.body.penis.size =
				PenisSizeTier.find(fxrng.nextInt(ChargenRules.penisMin, ChargenRules.penisMax + 1)).value;
		}
		this.body.height = 145 + (sex === 'm' ? fxrng.d6(2) : fxrng.d6(1)) * 5;
		this.update();
	}
	setRace(race: string) {
		this.race = race;
		// TODO set body
		this.update();
	}
	setClass(cclass: string|null) {
		this.cclass = cclass;
		this.update();
	}
	get classObject(): CharacterClass | null {
		if (!this.cclass) return null;
		return Game.instance.data.classes.get(this.cclass)
	}
	setPerk(perk: string|null) {
		this.perk = perk;
		this.update();
	}
	get perkObject(): PerkType | null {
		if (!this.perk) return null;
		return Game.instance.data.perks.get(this.perk);
	}

	///////////////
	// Internals //
	///////////////

	reset() {
		this.internalUpdate = true;
		this.createEmptyPlayer();
		this.updatePlayer();
		this.internalUpdate = false;
	}
	createEmptyPlayer() {
		this.body = new CharacterBody(null);
		// Origin
		this.origin = null;
		// Identity
		this.setSex(fxrng.nextBoolean() ? 'm' : 'f');
		this.setRandomName()
		// Race
		this.race = 'human';
		// Appearance
		this.body.hairColor1 = fxrng.pick(this.allowedHairColors());
		this.body.eyes.color = fxrng.pick(this.allowedEyeColors());
		this.body.skinColor1 = fxrng.pick(this.allowedSkinColors());
		// Class
		this.cclass = null;
		// Attributes
		this.attrs = Array(TAttributes.length).fill(ChargenRules.defaultAttr);
		this.attrPoints = ChargenRules.attributePoints;
		// Stats
		this.lib = 0;
		this.perv = 0;
		this.cor = 0;
		// Skills
		this.skillPointsSpent = 0;
		this.skills = {};
		// Perks
		this.perk = null;
	}
	/** Recreate player */
	private updatePlayer() {
		// We recreate player from scratch on update to guard against possible exploits;
		// alternatively, could keep same player and carefully revert when something edited in early steps

		this.player = new PlayerCharacter();
		// Origin
		if (this.origin) this.player.originId = this.origin;
		// Identity
		this.player.name = this.name;
		// Race
		// TODO race
		// Appearance
		this.player.body.copyFrom(this.body);
		// Class
		// TODO class
		// Attributes
		for (let i = 0; i < this.attrs.length; i++) this.player.stats.naturalAttrs[i] = this.attrs[i];
		// Stats
		this.player.stats.naturalLib = this.lib;
		this.player.stats.naturalPerv = this.perv;
		this.player.stats.cor = this.cor;
		// Skills
		if (this.skillPointsSpent > this.skillPointsTotal()) {
			this.skillPointsSpent = 0;
			this.skills = {};
		}
		for (let [id, value] of Object.entries(this.skills)) {
			this.player.stats.naturalSkills[id] = value;
		}
		// Perks
		if (this.perkObject) this.player.addPerk(this.perkObject);

		this.player.origin.adjustPlayer?.(this.player);
		this.player.updateStats();
		this.player.ctrl.recoverStats();
	}
	createRandomPlayer() {
		this.internalUpdate = true;
		this.createEmptyPlayer()
		// Origin
		this.origin = fxrng.pick(Game.instance.idata.playerOrigins).id;
		// Identity
		this.setSex(this.futanariAllowed() ? fxrng.either('m','f','h') : fxrng.either('m','f'));
		this.setRandomName()
		// Race
		// TODO random race
		// Appearance
		// random appearance is generated in createEmptyPlayer() and setSex()
		// Class
		this.cclass = fxrng.pick(Game.instance.data.classes.keys())
		// Attributes
		// TODO class-dependent attributes
		while (this.attrPoints > 0) {
			let attr = fxrng.pick(TAttributes);
			if (this.attrPoints >= this.attrCost(attr)) this.attrInc(attr);
		}
		// Stats
		// TODO class-dependent starting stats
		// Skills
		// TODO class-dependent starting skills
		while (this.skillPointsSpent < this.skillPointsTotal()) {
			let validSkills = this.getUpgradeableSkills();
			if (validSkills.length === 0) break;
			this.skillInc(fxrng.pick(validSkills));
		}
		// Perks
		// TODO class-dependent perk
		this.perk = fxrng.pick(this.allowedPerks(false)).value;
		// Finalize
		this.updatePlayer();
		this.internalUpdate = false;
	}

	update(): void {
		if (this.internalUpdate) return;
		this.updatePlayer()
		this.screen.update()
	}

	attrInc(id: TAttribute): void {
		this.attrPoints -= this.attrCost(id);
		this.attrs[id]++;
		this.update()
	}
	attrDec(id: TAttribute): void {
		this.attrs[id]--;
		this.attrPoints += this.attrCost(id);
		this.update()
	}
	attrCost(id: TAttribute): number {
		let x = this.attrs[id];
		// 1 at 8 and below, +1 for each 2
		return Math.max(1, 1 + Math.floor((x - 8) / 2));
	}
	attrMod(id: TAttribute): number {
		return this.attrs[id] - 5;
	}
	canIncAttr(id: TAttribute): boolean {
		return this.attrs[id] < ChargenRules.maxAttr && this.attrPoints >= this.attrCost(id)
	}
	canDecAttr(id: TAttribute): boolean {
		return this.attrs[id] > ChargenRules.minAttr
	}
	statInc(stat: IChargenSecondaryStat): void {
		(this as any)[stat.key]++;
		this.update()
	}
	statDec(stat: IChargenSecondaryStat): void {
		(this as any)[stat.key]--;
		this.update()
	}
	canIncStat(stat: IChargenSecondaryStat): boolean {
		return stat.natural < stat.max;
	}
	canDecStat(stat: IChargenSecondaryStat): boolean {
		return stat.natural > stat.min;
	}
	canIncSkill(skill: Skill): boolean {
		return (this.skills[skill.resId] ?? 0) < this.skillMax(skill);
	}
	canDecSkill(skill: Skill): boolean {
		return (this.skills[skill.resId] ?? 0) > 0;
	}
	skillNatural(skill: Skill): number {
		return this.skills[skill.resId] ?? 0;
	}
	skillTotal(skill: Skill): number {
		return (this.skills[skill.resId] ?? 0) + (skill.attr >= 0 ? this.attrMod(skill.attr) : 0);
	}
	skillInc(skill: Skill): void {
		this.skills[skill.resId] = (this.skills[skill.resId] ?? 0) + 1;
		this.skillPointsSpent++;
		this.update();
	}
	skillDec(skill: Skill): void {
		this.skills[skill.resId] = (this.skills[skill.resId] ?? 0) - 1;
		this.skillPointsSpent--;
		this.update();
	}
}
