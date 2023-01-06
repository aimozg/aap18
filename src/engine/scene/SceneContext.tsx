import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {Game} from "../Game";
import {StateManager} from "../state/StateManager";
import {Scene, SceneFn} from "./Scene";
import {GameScreenLayout} from "../ui/screens/GameScreen";
import {Deferred} from "../utils/Deferred";
import {Button} from "../ui/components/Button";
import {createRef, h} from "preact";
import {LogManager} from "../logging/LogManager";
import {GameController, SkillCheckResult, UseSkillOptions} from "../GameController";
import {GameContext} from "../state/GameContext";
import {BattleContext, BattleOptions} from "../combat/BattleContext";
import {AmbushDef, AmbushRules} from "./ambush";
import {Random} from "../math/Random";
import {KeyCodes} from "../ui/KeyCodes";
import {Inventory} from "../objects/Inventory";
import {Item} from "../objects/Item";
import {Creature} from "../objects/Creature";
import {TextOutput} from "../text/output/TextOutput";
import {CreaturePanel} from "../ui/panels/CreaturePanel";

export interface ChoiceOptions {
	/** Button text */
	label?: string;
	/** Displayed on hover */
	tooltip?: string;
	/** Displayed on the side */
	hint?: string;
	default?: boolean;
	hotkey?: string;
	clear?: boolean;
	disabled?: boolean | { hint?: string, tooltip?: string };
	hide?: boolean;
	value?: any;
}

export interface ChoiceWithLabel {
	label: string;
}

export interface ChoiceGotoScene extends ChoiceOptions {
	scene: string;
}

export interface ChoiceGotoCall extends ChoiceOptions {
	call: SceneFn;
}

export interface ChoiceOptionsDisabled extends ChoiceOptions {
	disabled: true | { hint?: string; tooltip?: string };
}

export type ChoiceDataNoLabel = ChoiceGotoScene | ChoiceGotoCall | ChoiceOptionsDisabled;
export type ChoiceData = ChoiceDataNoLabel & ChoiceWithLabel;

export interface InternalChoiceData {
	clear: boolean;
	label: string;
	hint?: string;
	tooltip?: string;
	value: string;
	disabled: boolean;
	/** Prefixed key code */
	hotkey: string | undefined;
	default: boolean;
	callback: () => void;
}

const logger = LogManager.loggerFor("engine.scene.SceneContext");

export class SceneContext implements GameContext {
	constructor(
		private _sceneId: string,
		private _sceneFn: SceneFn,
		public output: TextOutput
	) {
	}

	toString() { return `SceneContext(${this.sceneId})`}

	// TODO do we need it? the original intent was to invoke a dialogue and use its result
	lastValue: string = '';
	refCharacterPanel = createRef<CreaturePanel>()

	public get sceneId(): string { return this._sceneId }

	private _ended = false;
	private nextButtons: InternalChoiceData[] = [];
	private currentButtons: InternalChoiceData[] = [];
	private _promise = new Deferred<string>();
	private _dirty = true;

	get promise(): Promise<string> { return this._promise }

	readonly game: Game = Game.instance;
	readonly state: StateManager = Game.instance.state;

	get player(): PlayerCharacter { return Game.instance.state.player }

	get gc(): GameController { return Game.instance.gameController }

	get ended(): boolean { return this._ended; }

	get layout(): GameScreenLayout {
		return {
			left: <CreaturePanel creature={this.player} ref={this.refCharacterPanel}/> ,
			center: <div class="scene-panel">{this.output.panel.astsx}</div>
		}
	}

	private async beginScreen(append: boolean) {
		logger.debug("beginScreen in {}", this.sceneId)
		if (!append) this.clear();
		this.nextButtons = [];
		this.currentButtons = []
		this.refCharacterPanel.current?.update()
		this.output.scrollDown();
	}

	protected async flush() {
		logger.debug("flush in {}", this.sceneId);
		if (this._ended) {
			this._promise.tryResolve(String(this.lastValue ?? ''));
			return;
		}
		if (!this._dirty) return;
		this.refCharacterPanel.current?.update()
		this._dirty = false;
		this.checkDeadEnd();
		this.output.appendAction(<div class="choices">{this.nextButtons.map(btn =>
			<div class="choice">
				<Button label={btn.label}
				        disabled={btn.disabled}
				        hotkey={btn.hotkey}
				        tooltip={btn.tooltip}
				        className={"-link" + (btn.default ? " -default" : "")}
				        onClick={() => this.buttonClick(btn)}/>
				{btn.hint && <span className="choice-hint">{btn.hint}</span>}
			</div>)
		}</div>);
		this.currentButtons = this.nextButtons;
		this.nextButtons = [];
		this.output.flush();
	}

	protected checkDeadEnd() {
		if (this.nextButtons.length === 0) {
			// TODO rescue
			throw new Error(`Dead end in scene ${this.sceneId}.`)
		}
	}

	protected async buttonClick(c: InternalChoiceData) {
		logger.debug("buttonClick {}", c.value);
		this._dirty = true;
		if (c.clear) {
			this.output.clear()
		} else {
			this.output.flip("["+c.label+"]");
		}
		await c.callback();
		setTimeout(() => this.flush(), 0);
	}

	private async finish() {
		this._dirty = true;
		this._ended = true;
		await this.flush();
	}

	async play(scene: string | Scene, append: boolean = false): Promise<string> {
		logger.debug("play {}", scene);
		scene = this.game.data.scene(scene);
		this._sceneId = scene.resId;
		this._sceneFn = scene.sceneFn.bind(scene);
		return this.playCurrentScene(append);
	}

	async playCurrentScene(append: boolean = false): Promise<string> {
		this._dirty = true;

		await this.beginScreen(append);
		await this._sceneFn(this);
		await this.flush();

		return this.promise;
	}

	clear() {
		logger.trace("clear")
		this._dirty = true;
		this.output.flip();
	}

	/**
	 * Set parser actor (the object described by tags). Previously selected actor can be restored with `deselectActor`
	 */
	selectActor(actor:Creature) {
		this.output.selectActor(actor);
	}
	deselectActor() {
		this.output.deselectActor();
	}

	say(text: string, parseTags: boolean = true) {
		logger.trace("say {}", text)
		this._dirty = true;
		this.output.print(text, parseTags);
	}

	choicelist(...choices: ChoiceData[]) {
		logger.trace("choiceList")
		this._dirty = true;

		this.nextButtons = choices.filter(c => !c.hide).map((c, i) => {
			let callback;
			if ('scene' in c) {
				callback = ((scene) => () => this.play(scene))(c.scene)
			} else if ('call' in c) {
				callback = () => c.call(this);
			} else {
				// TODO ()=>this.error
				callback = () => {this.say("Error (no button callback)")}
			}
			let hint = c.hint;
			let tooltip = c.tooltip;
			let disabled = !!c.disabled;
			if (typeof c.disabled === 'object') {
				if (c.disabled.hint !== undefined) hint = c.disabled.hint
				if (c.disabled.tooltip !== undefined) {
					tooltip = tooltip ? (tooltip + "<br>") : "";
					tooltip += c.disabled.tooltip
				}
			}
			return {
				clear: c.clear ?? false,
				label: c.label,
				hint,
				tooltip,
				default: c.default ?? false,
				hotkey: c.hotkey ?? KeyCodes.DefaultHotkeys[i],
				value: 'value' in c ? c.value : c.label,
				disabled,
				callback
			}
		});
	}

	onKeyboardEvent(event: KeyboardEvent): void {
		let hk = KeyCodes.eventToHkString(event);
		let btn = this.currentButtons.find(b => !b.disabled && b.hotkey === hk);
		if (btn) {
			event.preventDefault();
			this.buttonClick(btn).then();
		}
	}

	choices(choices: Record<string, ChoiceDataNoLabel | SceneFn | string>) {
		this._dirty = true;
		this.choicelist(...Object.entries(choices).map(([k, v]) => {
			if (typeof v === 'function') {
				return {label: k, call: v}
			} else if (typeof v === 'string') {
				return {label: k, scene: v}
			} else {
				return Object.assign({label: k}, v)
			}
		}))
	}

	async flipPage(label: string = "Continue", clear: boolean = false): Promise<void> {
		logger.trace("flipPage...")
		this._dirty = true;
		return new Promise((resolve) => {
			this.choicelist({
				label,
				default: true,
				clear,
				call() {
					logger.debug("        ...done!");
					resolve();
				}
			});
			return this.flush();
		})
	}

	next(sceneId: string, label: string = "Continue", clear: boolean = false) {
		logger.trace("next {}", sceneId);
		this._dirty = true;
		this.choicelist({
			label,
			default: true,
			clear,
			scene: sceneId
		})
	}

	// TODO make it return AmbushResult
	async ambush(def: AmbushDef) {
		await AmbushRules.doAmbush(def, this)
	}

	async pickupItems(items:Item[]) {
		if (this.player.inventory.canTakeAll(items)) {
			this.player.inventory.addAll(items);
			await this.flipPage();
		} else {
			await this.flipPage("Transfer");
			await this.gc.openTransferMenu(Inventory.wrap(items));
		}
	}

	impossible() {
		this.say("<text-error>This should never happen. Report a bug.</text-error>");
	}

	endNow(value?: string) {
		logger.info("endNow {}", value ?? '')
		this._dirty = true;
		if (this._ended) {
			throw new Error("Duplicate end call");
		}
		this.lastValue = value ?? this.lastValue ?? '';
		this.finish().then()
	}

	endButton({value, label = "END"}: { value?: string, label?: string } = {}) {
		logger.info("endButton {}", value ?? '')
		this._dirty = true;
		if (this._ended) {
			throw new Error("Duplicate end call");
		}
		this.lastValue = value ?? this.lastValue ?? '';
		this.choicelist({
			label: label,
			call: () => {
				this.finish().then();
			}
		})
	}

	get lastBattle() { return this.state.lastBattle }
	get lastBattleResult() { return this.state.lastBattle?.result ?? {type:"draw",lust:false} }
	get lastBattleVictory() { return this.state.lastBattle?.isVictory }
	get lastBattleLustVictory() { return this.state.lastBattle?.isLustVictory }
	get lastBattleHpVictory() { return this.state.lastBattle?.isHpVictory }
	get lastBattleDefeat() { return this.state.lastBattle?.isDefeat }
	get lastBattleLustDefeat() { return this.state.lastBattle?.isLustDefeat }
	get lastBattleHpDefeat() { return this.state.lastBattle?.isHpDefeat }

	async startBattleAndContinue(options: BattleOptions): Promise<BattleContext> {
		logger.info("startBattleAndContinue {}", options);
		let ctx = this.gc.startBattle(options);
		return ctx.promise
	}

	endAndBattle(options: BattleOptions) {
		logger.info("endAndBattle {}", options);
		this.promise.then(() => {
			this.gc.startBattle(options);
		})
		this.endButton({label: "FIGHT"})
	}

	endNowAndBattle(options: BattleOptions) {
		logger.info("endNowAndBattle {}", options)
		this.promise.then(() => {
			this.gc.startBattle(options);
		})
		this.endNow();
	}

	///////////////
	// Utilities //
	///////////////

	get rng(): Random { return this.gc.rng }

	d6(): number { return this.rng.d6() }
	d20(): number { return this.rng.d20() }
	either<T>(...options:T[]):T { return this.rng.either(...options) }

	useSkill(options:UseSkillOptions):SkillCheckResult {
		return this.gc.useSkill(options)
	}
}

