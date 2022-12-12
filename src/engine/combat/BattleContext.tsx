/*
 * Created by aimozg on 25.07.2022.
 */
import {Creature} from "../objects/Creature";
import {GameContext} from "../state/GameContext";
import {GameScreenLayout} from "../ui/screens/GameScreen";
import {CreaturePanel, CreatureValueId} from "../ui/panels/CreaturePanel";
import {Deferred} from "../utils/Deferred";
import {AnimationTimeFast, BattleResult, BattleResultType, BattleState, CombatController} from "./CombatController";
import {milliTime} from "../utils/time";
import {coerce} from "../math/utils";
import {BattlePanel} from "../ui/panels/BattlePanel";
import {Game} from "../Game";
import {CombatAction} from "./CombatAction";
import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {CombatRules} from "../../game/combat/CombatRules";
import {BattleGrid} from "./BattleGrid";
import {h} from "preact";
import {Fragment} from "preact/compat";
import {BattleActionsPanel} from "../ui/panels/BattleActionsPanel";
import {Scene, SceneFn} from "../scene/Scene";
import {CoreConditions} from "../objects/creature/CoreConditions";

export let MillisPerRound = 1000;

export interface BattleMapMapping {
	tile: string;
	spawn?: "party"|"enemy";
	visible?: boolean;
}
export interface BattleMapOptions {
	cells: string[];
	mappings?: Record<string,BattleMapMapping>;
}
export type BattleVictoryOptions = {
	victory: string|Scene;
} | {
	lustVictory: string|Scene;
	hpVictory: string|Scene;
}
export type BattleDefeatOptions = {
	defeat: string|Scene;
} | {
	lustDefeat: string|Scene;
	hpDefeat: string|Scene;
}
export type BattleThenOptions = BattleVictoryOptions & BattleDefeatOptions;
export type BattleThen = null | string | Scene | SceneFn | BattleThenOptions;
export interface BattleOptions {
	player?: PlayerCharacter;
	party?: Creature[];
	enemies: Creature[];
	ambushed?:'party'|'enemies';

	map?: BattleMapOptions;
	/**
	 * After battle:
	 * * `null` - do nothing, return to place menu
	 * * `(ctx:SceneContext)=>{}` - play scene
	 * * sceneId | Scene - play scene
	 * * { victory, lustVictory, hpVictory, defeat, lustDefeat, hpDefeat } - play scene depending on battle result
	 */
	then: BattleThen;
}
export interface BattleSettings {
	player: PlayerCharacter;
	party: Creature[];
	enemies: Creature[];

	grid: BattleGrid;
	ambushed:'party'|'enemies'|undefined;
	afterEnd: (battle:BattleContext)=>Promise<void>;
}
export class BattleContext implements GameContext {
	constructor(
		public settings: BattleSettings
	) {
		this.cc = new CombatController(this);
		this.battlePanel.init();
		this.enemyPanel = new CreaturePanel(this.cc.enemies[0]);
		this.enemyPanel.options.money = false;
		this.charPanelWasCollapsed = this.characterPanel.collapsed;
		this.characterPanel.collapse();
		this.enemyPanel.collapse();
	}
	toString() { return `[BattleContext ${this.state} ${this.resultType}]`}

	get party() { return this.cc.party }
	get enemies() { return this.cc.enemies }

	get state(): BattleState { return this.cc.state; }

	get result():BattleResult { return this.cc.result }
	get resultType():BattleResultType { return this.cc.result.type }

	get isVictory() { return this.resultType === "victory" }
	get isLustVictory() { return this.isVictory && this.result.lust }
	get isHpVictory() { return this.isVictory && !this.result.lust }
	get isDefeat() { return this.resultType === "defeat" }
	get isLustDefeat() { return this.isDefeat && this.result.lust }
	get isHpDefeat() { return this.isDefeat && !this.result.lust }
	get isDraw() { return this.resultType === "draw" }

	private readonly charPanelWasCollapsed: boolean;

	public get grid(): BattleGrid { return this.cc.grid };

	public player: PlayerCharacter = this.settings.player;

	get playerCanAct():boolean { return this.state === "pc" || this.state === "ended"}

	readonly cc: CombatController

	private _promise = new Deferred<BattleContext>()
	get ended(): boolean { return this._promise.completed; }
	get promise(): Promise<BattleContext> { return this._promise }

	async onBattleFinishClick() {
		await this.cc.battleClose();
	}
	readonly characterPanel = Game.instance.screenManager.sharedPlayerPanel
	readonly enemyPanel
	// TODO instead of reusing exact same element, request new "Chapter"
	readonly logPanel = Game.instance.screenManager.sharedTextPanel
	readonly battlePanel = new BattlePanel(this)
	readonly battleActionsPanel = new BattleActionsPanel(this)
	get layout(): GameScreenLayout {
		return {
			className: "-combat",
			// TODO support multiple battlers
			// TODO expanding one collapses others
			left: <Fragment>
				{/*<h3 class="text-positive mt-0">Party:</h3>*/}
				{this.characterPanel.astsx}
				<h3 class="text-negative">Enemies:</h3>
				{this.enemyPanel.astsx}
			</Fragment>,
			right: this.battleActionsPanel.astsx,
			center: this.battlePanel.astsx,
			bottom: this.logPanel.astsx
		}
	}
	private playerActions():CombatAction<any>[] {
		return CombatRules.playerActions(this.player, this.cc);
	}
	async execAction(action:CombatAction<any>) {
		if (this.playerCanAct) {
			await this.cc.performAction(action);
		}
	}
	// TODO move animation to ctrl
	animateValueChange(creature:Creature, key:CreatureValueId, newValue:number, durationMs:number) {
		// TODO wait for half of the animation time? so animations won't stack on top of each other
		let panel = [this.characterPanel, this.enemyPanel].find(p=>p.creature === creature);
		if (!panel) return;
		panel.animateValue(key, newValue, durationMs);
	}
	redraw(updateActions:boolean=true) {
		if (this.state === "closed") return;
		this.characterPanel.update()
		this.enemyPanel.update()
		if (this.state === "ended") {
			this.battleActionsPanel.showFinishBattle();
		} else if (updateActions) {
			this.battleActionsPanel.showActions(this.playerActions(), this.state === "pc")
		}
		this.battlePanel.update()
	}
	update() {
		switch (this.state) {
			case "starting":
				this.logPanel.newChapter("Battle");
				this.cc.battleStart();
				break;
			case "flow":
				this.scheduleTick();
				break;
			case "animation":
			case "pc":
			case "npc":
			case "closed":
			case "ended":
				this.redraw();
		}
	}
	private _scheduled = false
	private _t1 = milliTime()
	scheduleTick() {
		if (this._scheduled) return;
		this._t1 = milliTime()
		this._scheduled = true
	}
	async animationFrame(dt:number, t2:number) {
		if (this._scheduled) {
			this._scheduled = false;
			let dticks = coerce(t2 - this._t1, 1, 1000);
			dticks = Math.round(dticks*1000/MillisPerRound)
			await this.tick(dticks);
		}
		this.battlePanel.animationFrame(dt,t2);
		this.characterPanel.animationFrame(dt);
		this.enemyPanel.animationFrame(dt);
	}
	stateChanged(state:BattleState, oldState:BattleState) {
		let updateActions = state === "pc" || oldState === "pc" || oldState === "starting";
		this.redraw(updateActions);
		switch (state) {
			case "ended":
				switch (this.resultType) {
					case "victory":
						this.logPanel.newChapter("Victory!","text-positive");
						break;
					case "defeat":
						this.logPanel.newChapter("Defeat!","text-negative");
						break;
					case "draw":
						this.logPanel.newChapter("Draw!");
						break;
					case "cancelled":
						break;
				}
				break;
			case "closed":
				this.characterPanel.collapsed = this.charPanelWasCollapsed;
				this._promise.resolve(this);
				Game.instance.gameController.battleEnded(this);
				return;
			case "flow":
				this.scheduleTick();
				break;
			case "npc":
				if (this.cc.nextActor?.hasCondition(CoreConditions.Unaware) || !this.cc.nextActor?.canAct) {
					this.cc.advanceTime(0).then();
				} else {
					// "thinking" pause
					setTimeout(async () => {
						await this.cc.advanceTime(0);
					}, AnimationTimeFast);
				}
				break;
			default:
				break;
		}
	}
	private async tick(dticks:number) {
		this._scheduled = false;
		if (this.cc.state === "flow") {
			await this.cc.advanceTime(dticks);
			if (this.cc.state === "flow") {
				this.redraw()
				this.scheduleTick()
			}
		}
	}
	onKeyboardEvent(event: KeyboardEvent): void {
		if (this.playerCanAct) {
			this.battleActionsPanel.onKeyboardEvent(event);
		}
	}

}
