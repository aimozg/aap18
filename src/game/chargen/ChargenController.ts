/*
 * Created by aimozg on 14.07.2022.
 */

import {PlayerCharacter} from "../../engine/objects/creature/PlayerCharacter";
import {ChargenRules} from "./ChargenRules";
import {TAttribute, TAttributes} from "../../engine/rules/TAttribute";
import fxrng from "../../engine/math/fxrng";
import {defaultGender, TSex} from "../../engine/rules/gender";
import {NewGameScreen} from "../ui/NewGameScreen";
import {CharacterBody} from "../../engine/objects/creature/Character";
import {BreastSizeTier, BreastSizeTiers} from "../data/body/Breasts";
import {randomName} from "../data/text/names";
import {ButtonMenuItem} from "../../engine/ui/components/ButtonMenu";
import {Color} from "../../engine/objects/Color";
import {HumanEyeColorNames, HumanHairColorNames, HumanSkinColorNames} from "../data/colors";
import {Game} from "../../engine/Game";
import {IStatMetadata, StatMetadata} from "../data/stats";
import {CharacterClass} from "../../engine/rules/classes/CharacterClass";
import {PenisSizeTier} from "../data/body/Penis";

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
			label: 'Halfkin Cat',
			value: 'half-cat',
			disabled: true
		}, {
			label: 'Beastkin Cat',
			value: 'beast-cat',
			disabled: true
		}, {
			label: 'Halfkin Wolf',
			value: 'half-wolf',
			disabled: true
		}, {
			label: 'Beastkin Wolf',
			value: 'beast-wolf',
			disabled: true
		}, {
			label: 'Halfkin Fox',
			value: 'half-fox',
			disabled: true
		}, {
			label: 'Beastkin Fox',
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
	allowedBreastSizes(): ButtonMenuItem<number>[] {
		let min: number, max: number;
		if (this.sex === 'm') {
			min = BreastSizeTiers.FLAT.value;
			max = ChargenRules.breastsMaxMale;
		} else {
			min = ChargenRules.breastsMinFemale;
			max = ChargenRules.breastsMaxFemale;
		}
		return BreastSizeTier.list().map(bst => ({
			label: bst.name,
			value: bst.value,
			disabled: bst.value < min || bst.value > max
		}))
	}
	allowedPenisSizes(): ButtonMenuItem<number>[] {
		let min = ChargenRules.penisMin;
		let max = ChargenRules.penisMax;
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
	// Traits

	/////////////
	// Setters //
	/////////////

	setOrigin(originId: string) {
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
	setClass(cclass: string) {
		this.cclass = cclass;
		this.update();
	}
	get classObject(): CharacterClass | null {
		return Game.instance.data.classes.get(this.cclass)
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
		// Traits
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
		for (let i = 0; i < this.attrs.length; i++) this.player.naturalAttrs[i] = this.attrs[i];
		// Stats
		this.player.naturalLib = this.lib;
		this.player.naturalPerv = this.perv;
		this.player.cor = this.cor;
		// Traits
		this.player.origin.adjustPlayer?.(this.player);
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
		// Traits
		// TODO random/class-dependent trait
		// Finalize
		this.updatePlayer();
		this.internalUpdate = false;
	}
	update() {
		if (this.internalUpdate) return;
		this.updatePlayer()
		this.screen.update()
	}

	attrInc(id: TAttribute) {
		this.attrPoints -= this.attrCost(id);
		this.attrs[id]++;
		this.update()
	}
	attrDec(id: TAttribute) {
		this.attrs[id]--;
		this.attrPoints += this.attrCost(id);
		this.update()
	}
	attrCost(id: TAttribute): number {
		let x = this.attrs[id];
		// 1 at 8 and below, +1 for each 2
		return Math.max(1, 1 + Math.floor((x - 8) / 2));
	}
	canIncAttr(id: TAttribute) {
		return this.attrs[id] < ChargenRules.maxAttr && this.attrPoints >= this.attrCost(id)
	}
	canDecAttr(id: TAttribute) {
		return this.attrs[id] > ChargenRules.minAttr
	}
	statInc(stat: IChargenSecondaryStat) {
		(this as any)[stat.key]++;
		this.update()
	}
	statDec(stat: IChargenSecondaryStat) {
		(this as any)[stat.key]--;
		this.update()
	}
	canIncStat(stat: IChargenSecondaryStat): boolean {
		return stat.natural < stat.max;
	}
	canDecStat(stat: IChargenSecondaryStat): boolean {
		return stat.natural > stat.min;
	}
}
