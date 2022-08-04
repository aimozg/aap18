import {AbstractScreen} from "../../engine/ui/AbstractScreen";
import {h, VNode} from "preact";
import {Button} from "../../engine/ui/components/Button";
import {ButtonMenu} from "../../engine/ui/components/ButtonMenu";
import {ChargenStepOrigin} from "../chargen/ChargenStepOrigin";
import {ChargenStepSex} from "../chargen/ChargenStepSex";
import {ChargenStepRace} from "../chargen/ChargenStepRace";
import {ChargenStepStats} from "../chargen/ChargenStepStats";
import {ChargenStepClass} from "../chargen/ChargenStepClass";
import {ChargenStepTraits} from "../chargen/ChargenStepTraits";
import {ChargenStepAppearance} from "../chargen/ChargenStepAppearance";
import {ChargenStepFinalize} from "../chargen/ChargenStepFinalize";
import {CGPCData, ChargenRules} from "../chargen/chargenData";
import {ChargenStep} from "../chargen/ChargenStep";
import {PlayerCharacter} from "../../engine/objects/creature/PlayerCharacter";
import {randomName} from "../data/text/names";
import fxrng from "../../engine/math/fxrng";
import {ChargenStepAttrs} from "../chargen/ChargenStepAttrs";

function randomStartingPlayer(empty:Boolean): PlayerCharacter {
	let player = new PlayerCharacter();

	// sex and name
	fxrng.pick([
		() => {
			player.sex = 'm';
			player.gender = 'm';
		},
		() => {
			player.sex = 'f';
			player.gender = 'f';
		}
	])();
	player.name = randomName(player.gender);

	// appearance
	// TODO

	if (!empty) {
		// TODO origin, attrs, skills, class
	}

	return player;
}

export class NewGameScreen extends AbstractScreen {

	private completeResolve: (started: PlayerCharacter) => void = null;
	private completePromise: Promise<PlayerCharacter> = new Promise((resolve) => {
		this.completeResolve = resolve;
	});
	private tab: number = 0;
	private pcdata: CGPCData = {
		player: randomStartingPlayer(true),
		race: 'human',
		ppoints: ChargenRules.attributePoints,
		cclass: 'warrior',
	};

	constructor() {
		super();
		let pcdata = this.pcdata;

		let onUpdate = this.updateSteps.bind(this);
		this.tabs = [
			new ChargenStepOrigin(pcdata, onUpdate),
			new ChargenStepSex(pcdata, onUpdate, false), // TODO allow herm characters
			new ChargenStepRace(pcdata, onUpdate, [{ // TODO list races
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
			}]),
			new ChargenStepAppearance(pcdata, onUpdate),
			new ChargenStepClass(pcdata, onUpdate),
			new ChargenStepAttrs(pcdata, onUpdate),
			new ChargenStepStats(pcdata, onUpdate),
			new ChargenStepTraits(pcdata, onUpdate),
			new ChargenStepFinalize(pcdata, onUpdate),
		];
		this.updateSteps();
	}

	async display(): Promise<PlayerCharacter> {
		return this.completePromise
	}

	private onCancelClick() {
		this.completeResolve(null);
	}

	private onCompleteClick() {
		this.completeResolve(this.pcdata.player);
	}

	private readonly tabs: ChargenStep[];

	private selectTab(tab: number) {
		this.tab = tab;
		this.render();
	}

	private updateSteps() {
		let good = true;
		for (let i = 0; i < this.tabs.length; i++) {
			this.tabs[i].unlocked = good;
			if (!this.tabs[i].complete()) good = false;
		}
		this.render();
	}

	node(): VNode {
		return <div class="grid-12 ui-box gap-4" style="width: 960px; grid-template-rows: auto min-content">
			<div class="col-span-2 d-flex flex-column">
				<ButtonMenu items={this.tabs.map((tab, i) => ({label: tab.label, value: i, disabled: !tab.unlocked}))}
				            className="-big"
				            selected={this.tab}
				            onChange={(i) => this.selectTab(i)}/>
				<div style="visibility:hidden"><Button className="-big"/></div>
				<Button className="-big" label="Cancel" onClick={() => this.onCancelClick()}></Button>
			</div>
			<div class="col-span-10 d-flex flex-column">
				<div style="min-height:18.5rem">
					{this.tabs[this.tab].node()}
				</div>
				<p class="mt-4">
					{this.tabs[this.tab + 1] &&
						<Button label="Next"
						        className="-big"
						        onClick={() => this.selectTab(this.tab + 1)}
						        disabled={!this.tabs[this.tab].complete()}/>}
					{!this.tabs[this.tab + 1] &&
						<Button label="Start Game"
						        className="-big"
						        onClick={() => this.onCompleteClick()}/>}
				</p>
			</div>
		</div>
	}
}

