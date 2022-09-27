import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {Game} from "../Game";
import {StateManager} from "../state/StateManager";
import {Scene, SceneFn} from "./Scene";
import {GameScreenLayout} from "../ui/screens/GameScreen";
import {Deferred} from "../utils/Deferred";
import {Parser} from "../text/parser/Parser";
import {TextOutput} from "../text/output/TextOutput";
import {Button} from "../ui/components/Button";
import {h} from "preact";
import {LogManager} from "../logging/LogManager";
import {GameController} from "../GameController";
import {GameContext} from "../state/GameContext";
import {BattleContext, BattleOptions} from "../combat/BattleContext";
import {CreaturePanel} from "../../game/ui/CreaturePanel";
import {AmbushDef, AmbushRules} from "./ambush";
import {Random} from "../math/Random";
import {KeyCodes} from "../ui/KeyCodes";

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

interface InternalChoiceData {
	clear: boolean;
	label: string;
	hint?: string;
	tooltip?: string;
	value: string;
	disabled: boolean;
	hotkey: string | undefined;
	default: boolean;
	callback: () => void;
}

const logger = LogManager.loggerFor("engine.scene.SceneContext");

export class SceneContext implements GameContext {
	constructor(
		public sceneId: string,
		public output: TextOutput
	) {
	}
	toString() { return `SceneContext(${this.sceneId})`}

	lastValue: string = '';
	readonly parser: Parser = new Parser();
	readonly characterPanel = new CreaturePanel();

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
			left: this.characterPanel.astsx,
			center: this.output.panel.astsx
		}
	}

	private async beginScreen(append: boolean) {
		logger.debug("beginScreen in {}", this.sceneId)
		if (!append) this.clear();
		this.nextButtons = [];
		this.currentButtons = []
		this.characterPanel.update(this.player)
	}
	private async flush() {
		logger.debug("flush in {}", this.sceneId);
		if (this._ended) {
			this._promise.tryResolve(String(this.lastValue ?? ''));
			return;
		}
		if (!this._dirty) return;
		this.characterPanel.update(this.player);
		this._dirty = false;
		if (this.nextButtons.length === 0) {
			// TODO rescue
			throw new Error(`Dead end in scene ${this.sceneId}.`)
		}
		// TODO tooltip
		this.output.appendAction(<div class="choices">{this.nextButtons.map(btn =>
			<div class="choice">
				<Button label={btn.label}
				        disabled={btn.disabled}
				        hotkey={btn.hotkey}
				        className={"-link" + (btn.default ? " -default" : "")}
				        onClick={() => this.buttonClick(btn)}/>
				{btn.hint && <span className="choice-hint">{btn.hint}</span>}
			</div>)
		}</div>);
		this.currentButtons = this.nextButtons;
		this.nextButtons = [];
		this.output.flush();
	}
	private async buttonClick(c: InternalChoiceData) {
		logger.debug("buttonClick {}", c.value);
		this._dirty = true;
		if (c.clear) {
			this.output.clear()
		} else {
			this.output.flip(c.label);
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
		this._dirty = true;
		scene = this.game.data.scene(scene);
		logger.debug("play {}", scene.resId);

		this.sceneId = scene.resId;
		await this.beginScreen(append);
		await scene.execute(this);
		await this.flush();

		return this.promise;
	}

	clear() {
		logger.trace("clear")
		this._dirty = true;
		this.output.flip();
	}

	say(text: string, parseTags: boolean = true) {
		logger.trace("say {}", text)
		this._dirty = true;
		let parsed = this.parser.parse(text, parseTags);
		this.output.print(parsed);
	}

	choicelist(...choices: ChoiceData[]) {
		logger.trace("choiceList")
		this._dirty = true;

		this.nextButtons = choices.filter(c => !c.hide).map((c,i) => {
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
		let btn = this.currentButtons.find(b=>!b.disabled && b.hotkey === hk);
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

	async ambush(def: AmbushDef) {
		await AmbushRules.doAmbush(def, this)
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

	async battleAndContinue(options: BattleOptions): Promise<BattleContext> {
		logger.info("battleAndContinue {}", options);
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

	d20(): number { return this.rng.d20() }
}
