/*
 * Created by aimozg on 25.07.2022.
 */
import {Creature} from "../objects/Creature";
import {GameContext} from "../state/GameContext";
import {GameScreenLayout} from "../ui/screens/GameScreen";
import {CreaturePanel, CreatureValueId} from "../../game/ui/CreaturePanel";
import {Deferred} from "../utils/Deferred";
import {CombatController, CombatFlowResultType} from "./CombatController";
import {milliTime} from "../utils/time";
import {coerce} from "../math/utils";
import {LogPanel} from "../ui/panels/LogPanel";
import {BattlePanel} from "../ui/panels/BattlePanel";
import {Game} from "../Game";
import {CombatAction} from "./CombatAction";
import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {CombatRules} from "../../game/combat/CombatRules";
import {BattleGrid} from "./BattleGrid";

export let MillisPerRound = 1000;

class FinishCombatAction extends CombatAction<void> {
	constructor(public ctx:BattleContext) {
		super(ctx.player);
	}
	protected disabledReason(cc: CombatController): string {
		if (!this.ctx.cc.ended) return "Combat not ended"
		return "";
	}
	label: string = "Finish";
	tooltip: string = "Finish battle";
	async perform(cc: CombatController): Promise<void> {
		this.ctx.onBattleFinishClick()
	}
}

export interface BattleMapMapping {
	tile: string;
	spawn?: "party"|"enemy";
	visible?: boolean;
}
export interface BattleMapOptions {
	cells: string[];
	mappings?: Record<string,BattleMapMapping>;
}
export interface BattleOptions {
	player?: PlayerCharacter;
	party?: Creature[];
	enemies: Creature[];

	map?: BattleMapOptions;
}
export interface BattleSettings {
	player: PlayerCharacter;
	party: Creature[];
	enemies: Creature[];

	grid: BattleGrid;
}

export class BattleContext implements GameContext {
	constructor(
		public options: BattleSettings
	) {
		this.cc = new CombatController(this)
		this.battlePanel.init();
		this.enemyPanel = new CreaturePanel(this.cc.enemies[0]);
		this.enemyPanel.options.money = false;
	}

	public get grid(): BattleGrid { return this.cc.grid };
	public player: PlayerCharacter = this.options.player;
	playerCanAct = false
	readonly cc: CombatController
	get ended(): boolean { return this._promise.completed; }
	private _promise = new Deferred<BattleContext>()
	get promise(): Promise<BattleContext> { return this._promise }
	battleEnded() {
		this.playerCanAct = false
	}
	onBattleFinishClick() {
		this._promise.resolve(this)
		Game.instance.gameController.showGameScreen()
	}
	readonly characterPanel = Game.instance.screenManager.sharedPlayerPanel
	readonly enemyPanel
	readonly logPanel = new LogPanel()
	readonly battlePanel = new BattlePanel(this)
	get layout(): GameScreenLayout {
		return {
			className: "-combat",
			left: this.characterPanel.astsx,
			right: this.enemyPanel.astsx,
			center: this.battlePanel.astsx,
			bottom: this.logPanel.astsx
		}
	}
	private _redrawing = false
	private playerActions():CombatAction<any>[] {
		if (this.cc.ended) return [new FinishCombatAction(this)];
		return CombatRules.playerActions(this.player, this.cc);
	}
	async execAction(action:CombatAction<any>) {
		if (action instanceof FinishCombatAction) {
			this.onBattleFinishClick()
		} else if (this.playerCanAct) {
			this.playerCanAct = false;
			await this.cc.performAction(action);
			this.scheduleTick()
		}
	}
	animateValueChange(creature:Creature, key:CreatureValueId, newValue:number, durationMs:number) {
		// TODO wait for half of the animation time? so animations won't stack on top of each other
		let panel = [this.characterPanel, this.enemyPanel].find(p=>p.creature === creature);
		if (!panel) return;
		panel.animateValue(key, newValue, durationMs);
	}
	redraw() {
		if (this._redrawing) return
		this._redrawing = true
		setTimeout(()=>{
			this._redrawing = false;
			this.characterPanel.update()
			this.enemyPanel.update()
			this.battlePanel.update(this.playerActions())
		}, 0)
	}
	update() {
		this.checkBattleStatus()
		this.redraw();
	}
	private _started = false
	checkBattleStatus() {
		if (!this._started) {
			this._started = true
			this.cc.battleStart()
		}
		this.scheduleTick();
	}
	private _scheduled = false
	private _t1 = milliTime()
	scheduleTick() {
		if (this._scheduled) return
		this.playerCanAct = false;
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
	private async tick(dticks:number) {
		this.playerCanAct = false
		let fr = this.cc.advanceTime(dticks);
		this.redraw()
		await this.cc.applyFlowResult(fr)
		if (fr.type === CombatFlowResultType.PLAYER_ACTION) {
			this.playerCanAct = true
		}
		if (fr.type !== CombatFlowResultType.COMBAT_ENDED && fr.type !== CombatFlowResultType.PLAYER_ACTION) {
			this.scheduleTick()
		}
	}
	onKeyboardEvent(event: KeyboardEvent): void {
		if (this.playerCanAct || this.cc.ended) {
			this.battlePanel.onKeyboardEvent(event);
		}
	}

}
