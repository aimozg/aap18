import {h, VNode} from "preact";
import {PlayerCharacter} from "../../objects/creature/PlayerCharacter";
import {AbstractModalScreen} from "../AbstractModalScreen";
import {ButtonMenu} from "../components/ButtonMenu";
import {AbstractPlayerScreenTab} from "./player/AbstractPlayerScreenTab";
import {PlayerStatsTab} from "./player/PlayerStatsTab";
import {Button, execUIAction, UIAction} from "../components/Button";
import {KeyCodes} from "../KeyCodes";
import {PlayerBodyTab} from "./player/PlayerBodyTab";
import {TAttribute} from "../../rules/TAttribute";
import {PlayerAttributesTab} from "./player/PlayerAttributesTab";
import {PlayerRaceTab} from "./player/PlayerRaceTab";
import {PlayerSkillsTab} from "./player/PlayerSkillsTab";
import {PlayerPerksTab} from "./player/PlayerPerksTab";
import {PlayerClassTab} from "./player/PlayerClassTab";
import {PlayerItemsTab} from "./player/PlayerItemsTab";
import {CreatureSkill} from "../../objects/creature/stats/CreatureSkill";
import {PerkType} from "../../rules/PerkType";

export class PlayerMenuScreen extends AbstractModalScreen<void> {
	constructor(
		public readonly player: PlayerCharacter,
		/**
		 * Can level up, spend points, use items etc
		 */
		public readonly interactive:boolean
	) {super();}

	private tabs:AbstractPlayerScreenTab[] = [
		new PlayerStatsTab(this),
		new PlayerBodyTab(this),
		new PlayerRaceTab(this),
		new PlayerClassTab(this),
		new PlayerAttributesTab(this),
		new PlayerSkillsTab(this),
		new PlayerPerksTab(this),
		new PlayerItemsTab(this),
		// space for 3 more buttons?
	]
	private tab:number = 0;

	selectTab(index:number) {
		if (this.tab === index) return;
		this.tab = index;
		this.render();
	}

	levelUp() {
		this.player.ctrl.levelUp();
		this.render();
	}
	incAttr(id:TAttribute) {
		this.player.ctrl.spendAttributePoint(id);
		this.render();
	}
	canIncSkill(skill:CreatureSkill) {
		return this.interactive && this.player.skillPoints > 0 && !skill.isMaxed
	}
	incSkill(skill:CreatureSkill) {
		this.player.ctrl.spendSkillPoint(skill.skill);
		this.render();
	}

	canTakePerk(perk:PerkType) {
		return this.interactive && this.player.perkPoints > 0 && perk.obtainableBy(this.player);
	}
	takePerk(perk:PerkType) {
		this.player.ctrl.spendPerkPoint(perk);
		this.render();
	}

	private aClose:UIAction = {
		label: "Close",
		hotkey: KeyCodes.ESCAPE,
		callback: ()=>this.close()
	}
	private uiActions:UIAction[] = [
		this.aClose,
		...this.tabs.map((tab,i)=>
			KeyCodes.DefaultHotkeys[i]
				? {hotkey:KeyCodes.DefaultHotkeys[i], callback: ()=>this.selectTab(i)}
				: null).filter(a=>!!a) as UIAction[]
	];

	node(): VNode {
		return <div class="d-flex flex-column ui-box ma-4 js-stretch">
			<div class="grid-lg-12 grid-md-6 grid-sm-4 gap-2 ma-4">
				<ButtonMenu items={this.tabs.map((tab,i)=>({
					label: tab.label,
					hotkey: KeyCodes.DefaultHotkeys[i],
					value: i
				}))}
				            className="-big"
				            selected={this.tab}
				            onChange={(i)=>this.selectTab(i)}/>
				<div style="grid-column: -1/-2">
					<Button className="-big" action={this.aClose}/>
				</div>

			</div>
			<div class="flex-grow-1 grid-4 gap-2">
				<div>
					<div class="ma-8 help-block">TODO character doll and some stats (hp, resources?) here</div>
				</div>
				<div class="cols-3">{this.tabs[this.tab].node()}</div>
			</div>
		</div>
	}


	onKeyboardEvent(event: KeyboardEvent) {
		execUIAction(event, this.uiActions)
	}
}
