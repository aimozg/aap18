/*
 * Created by aimozg on 25.07.2022.
 */
import {Creature} from "../objects/Creature";
import {GameContext} from "../state/GameContext";
import {GameScreenLayout} from "../ui/screens/GameScreen";
import {CreaturePanel} from "../../game/ui/CreaturePanel";
import {Deferred} from "../utils/Deferred";
import {CombatController, CombatFlowResultType} from "./CombatController";
import {milliTime} from "../utils/time";
import {coerce} from "../math/utils";
import {LogPanel} from "../ui/panels/LogPanel";
import {BattlePanel} from "../ui/panels/BattlePanel";
import {Game} from "../Game";

export let MillisPerRound = 1000;

export class BattleContext implements GameContext {
	constructor(
		party: Creature[],
		enemies: Creature[]
	) {
		this.cc = new CombatController(this, party, enemies)
	}

	playerCanAct = false
	readonly cc: CombatController
	get ended(): boolean { return this._promise.completed; }
	private _promise = new Deferred<BattleContext>()
	get promise(): Promise<BattleContext> { return this._promise }
	battleEnded() {
		this.playerCanAct = false
		// TODO add "Finish battle" final button
		setTimeout(()=>{
			this._promise.resolve(this)
			Game.instance.gameController.showGameScreen()
		}, 1000)
	}

	readonly characterPanel = new CreaturePanel()
	readonly enemyPanel = new CreaturePanel()
	readonly logPanel = new LogPanel()
	readonly battlePanel = new BattlePanel(this)
	layout: GameScreenLayout = {
		left: this.characterPanel.astsx,
		right: this.enemyPanel.astsx,
		center: this.battlePanel.astsx,
		bottom: this.logPanel.astsx
	}
	redraw() {
		this.characterPanel.update(this.cc.party[0])
		this.enemyPanel.update(this.cc.enemies[0])
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
	scheduleTick() {
		if (this._scheduled) return
		this._scheduled = true
		requestAnimationFrame(() => {
			this._scheduled = false
			this.tick().then()
		})
	}
	private _t1 = milliTime()
	private async tick() {
		let t2 = milliTime()
		let dt = coerce(t2 - this._t1, 1, 1000)
		dt = Math.round(dt*1000/MillisPerRound)
		this._t1 = t2;
		this.playerCanAct = false
		let fr = this.cc.advanceTime(dt);
		this.redraw()
		await this.cc.applyFlowResult(fr)
		if (fr.type === CombatFlowResultType.PLAYER_ACTION) {
			this.playerCanAct = true
		}
		if (fr.type !== CombatFlowResultType.COMBAT_ENDED && fr.type !== CombatFlowResultType.PLAYER_ACTION) {
			this.scheduleTick()
		}
	}

	async playerMeleeAttack() {
		this.playerCanAct = false;
		this._t1 = milliTime();
		this.scheduleTick();
		await this.cc.performMeleeAttack(this.cc.party[0], this.cc.enemies[0])
		this.redraw()
	}
}
