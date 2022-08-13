import {AbstractScreen} from "../../engine/ui/AbstractScreen";
import {h, VNode} from "preact";
import {Button} from "../../engine/ui/components/Button";
import {ButtonMenu} from "../../engine/ui/components/ButtonMenu";
import {ChargenStepOrigin} from "../chargen/ChargenStepOrigin";
import {ChargenStepIdentity} from "../chargen/ChargenStepIdentity";
import {ChargenStepRace} from "../chargen/ChargenStepRace";
import {ChargenStepStats} from "../chargen/ChargenStepStats";
import {ChargenStepClass} from "../chargen/ChargenStepClass";
import {ChargenStepTraits} from "../chargen/ChargenStepTraits";
import {ChargenStepAppearance} from "../chargen/ChargenStepAppearance";
import {ChargenStepFinalize} from "../chargen/ChargenStepFinalize";
import {ChargenStep} from "../chargen/ChargenStep";
import {PlayerCharacter} from "../../engine/objects/creature/PlayerCharacter";
import {ChargenStepAttrs} from "../chargen/ChargenStepAttrs";
import {ChargenController} from "../chargen/ChargenController";

export class NewGameScreen extends AbstractScreen {

	private completeResolve: (started: PlayerCharacter) => void = null;
	private completePromise: Promise<PlayerCharacter> = new Promise((resolve) => {
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
			new ChargenStepTraits(cc),
			new ChargenStepFinalize(cc),
		];
		this.update();
	}

	async display(): Promise<PlayerCharacter> {
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

	node(): VNode {
		return <div class="grid-12 ui-box gap-4" style="width: 960px; grid-template-rows: auto min-content">
			<div class="col-span-2 d-flex flex-column">
				<ButtonMenu items={this.tabs.map((tab, i) => ({label: tab.label, value: i, disabled: !tab.unlocked}))}
				            className="-big"
				            selected={this.tab}
				            onChange={(i) => this.selectTab(i)}/>
				<div style="visibility:hidden" class="flex-grow-1"></div>
				<Button className="-big" label="Cancel" onClick={() => this.onCancelClick()}></Button>
			</div>
			<div class="col-span-10 d-flex flex-column">
				<div>{/* style="min-height:23rem"*/}
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

