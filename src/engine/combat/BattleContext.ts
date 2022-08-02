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
import {BattleActionButton, BattlePanel} from "../ui/panels/BattlePanel";
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
	private _redrawing = false
	private playerActions():BattleActionButton[] {
		if (this.cc.ended) return [{
			label: "Finish battle",
			callback: ()=>{
				this._promise.resolve(this)
				Game.instance.gameController.showGameScreen()
			}
		}];
		let actions:BattleActionButton[] = [];
		// TODO targets
		actions.push({
			label: "Melee attack",
			callback: async ()=> {
				this.playerCanAct = false;
				await this.cc.performMeleeAttack(this.cc.party[0], this.cc.enemies[0]);
				this.scheduleTick();
			}
		})
		// TODO tease
		// TODO abilities
		return actions;
	}
	redraw() {
		if (this._redrawing) return
		this._redrawing = true
		setTimeout(()=>{
			this._redrawing = false;
			this.characterPanel.update(this.cc.party[0])
			this.enemyPanel.update(this.cc.enemies[0])
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
	scheduleTick() {
		if (this._scheduled) return
		this.playerCanAct = false;
		this._t1 = milliTime()
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
}
