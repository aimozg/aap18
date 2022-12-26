import {AbstractScreen} from "../ui/AbstractScreen";
import {h, VNode} from "preact";
import {Button} from "../ui/components/Button";
import {ButtonMenu} from "../ui/components/ButtonMenu";
import {ChargenStepOrigin} from "./ChargenStepOrigin";
import {ChargenStepIdentity} from "./ChargenStepIdentity";
import {ChargenStepRace} from "./ChargenStepRace";
import {ChargenStepStats} from "./ChargenStepStats";
import {ChargenStepClass} from "./ChargenStepClass";
import {ChargenStepPerks} from "./ChargenStepPerks";
import {ChargenStepAppearance} from "./ChargenStepAppearance";
import {ChargenStepFinalize} from "./ChargenStepFinalize";
import {ChargenStep} from "./ChargenStep";
import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {ChargenStepAttrs} from "./ChargenStepAttrs";
import {ChargenController} from "./ChargenController";
import {ChargenStepSkills} from "./ChargenStepSkills";

export class NewGameScreen extends AbstractScreen {

	private completeResolve: (started: PlayerCharacter|null) => void;
	private completePromise: Promise<PlayerCharacter|null> = new Promise((resolve) => {
		this.completeResolve = resolve;
	});
	private tab: number = 0;
	cc: ChargenController;

	constructor() {
		super();
		let cc = this.cc = new ChargenController(this);

		this.tabs = [
			new ChargenStepOrigin(cc),
			new ChargenStepIdentity(cc),
			new ChargenStepRace(cc),
			new ChargenStepAppearance(cc),
			new ChargenStepClass(cc),
			new ChargenStepAttrs(cc),
			new ChargenStepStats(cc),
			new ChargenStepSkills(cc),
			new ChargenStepPerks(cc),
			new ChargenStepFinalize(cc),
		];
		this.update();
	}

	async display(): Promise<PlayerCharacter|null> {
		return this.completePromise
	}

	private onCancelClick() {
		this.completeResolve(null);
	}

	private onCompleteClick() {
		this.cc.update()
		this.completeResolve(this.cc.player);
	}

	private readonly tabs: ChargenStep[];
	private allowedTabs: number = 1;

	private selectTab(tab: number) {
		this.tab = tab;
		this.allowedTabs = Math.max(tab+1, this.allowedTabs)
		this.update();
	}

	update() {
		let good = true;
		for (let i = 0; i < this.tabs.length; i++) {
			if (this.allowedTabs < i) good = false;
			this.tabs[i].unlocked = good;
			if (!this.tabs[i].complete()) good = false;
		}
		this.render();
	}

	randomChar() {
		this.cc.createRandomPlayer();
		this.selectTab(this.tabs.length-1);
	}

	node(): VNode {
		return <div class="grid-12 ui-box gap-4" style="width: 960px; grid-template-rows: auto min-content">
			<div class="cols-2 d-flex flex-column">
				<ButtonMenu items={this.tabs.map((tab, i) => ({label: tab.label, value: i, disabled: !tab.unlocked}))}
				            className="-big"
				            selected={this.tab}
				            onChange={(i) => this.selectTab(i)}/>
				<div class="mt-9"></div>
				<Button className="-big" label="Random" onClick={() => this.randomChar()}></Button>
				<div style="visibility:hidden" class="flex-grow-1"></div>
				<Button className="-big" label="Cancel" onClick={() => this.onCancelClick()}></Button>
			</div>
			<div class="cols-10 d-flex flex-column">
				<div>{/* style="min-height:23rem"*/}
					{this.tabs[this.tab].node()}
				</div>
				<p class="mt-8">
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

