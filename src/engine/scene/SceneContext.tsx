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
import {Creature} from "../objects/Creature";
import {BattleContext} from "../combat/BattleContext";
import {CreaturePanel} from "../../game/ui/CreaturePanel";

export interface ChoiceOptions {
	default?: boolean;
	hotkey?: string;
	clear?: boolean;
	disabled?: boolean;
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

export type ChoiceData = ChoiceGotoScene | ChoiceGotoCall;
export type ChoiceListData = ChoiceData & ChoiceWithLabel;

interface InternalChoiceData {
	clear: boolean;
	label: string;
	value: string;
	disabled: boolean;
	hotkey: string;
	default: boolean;
	callback: () => void;
}

const logger = LogManager.loggerFor("engine.scene.SceneContext");

export class SceneContext implements GameContext {
	constructor(
		public output: TextOutput
	) {
	}
	toString() { return `SceneContext(${this.sceneId})`}

	sceneId: string = '';
	lastValue: string = '';
	readonly parser: Parser = new Parser();
	readonly characterPanel = new CreaturePanel();

	private _ended = false;
	private buttons: InternalChoiceData[] = [];
	private _promise = new Deferred<string>();
	private _dirty = true;

	get promise():Promise<string> { return this._promise }
	readonly game: Game = Game.instance;
	readonly state: StateManager = Game.instance.state;
	get player(): PlayerCharacter { return Game.instance.state.player }
	get gc(): GameController { return Game.instance.gameController }
	get ended(): boolean { return this._ended; }
	readonly layout: GameScreenLayout = {
		left: this.characterPanel.astsx,
		center: this.output.panel.astsx
	}

	private async beginScreen(append: boolean) {
		if (!append) this.clear();
		this.buttons.splice(0);
		this.characterPanel.update(this.player)
	}
	private async flush() {
		logger.debug("flush() in {}",this.sceneId);
		if (this._ended) {
			this._promise.tryResolve(String(this.lastValue ?? ''));
			return;
		}
		if (!this._dirty) return;
		this.characterPanel.update(this.player);
		this._dirty = false;
		if (this.buttons.length === 0) {
			// TODO rescue
			throw new Error(`Dead end in scene ${this.sceneId}.`)
		}
		this.output.appendAction(<div class="choices">{this.buttons.map(btn =>
			<Button label={btn.label}
			        disabled={btn.disabled}
			        className={btn.default ? "-default" : ""}
			        onClick={() => this.buttonClick(btn)}
			/>)
		}</div>)
		this.buttons.splice(0);
		this.output.flush();
	}
	private async buttonClick(c: InternalChoiceData) {
		logger.debug("buttonClick({})", c.value);
		this._dirty = true;
		if (c.clear) {
			this.output.clear()
		} else {
			this.output.flip(c.label);
		}
		await c.callback();
		setTimeout(()=>this.flush(), 0);
	}
	private async finish() {
		this._dirty = true;
		this._ended = true;
		await this.flush();
	}
	async play(scene: string | Scene, append: boolean = false): Promise<string> {
		this._dirty = true;
		if (typeof scene === 'string') scene = this.game.data.scene(scene);
		logger.debug("play({})", scene.resId);

		this.sceneId = scene.resId;
		await this.beginScreen(append);
		await scene.execute(this);
		await this.flush();

		return this.promise;
	}

	clear() {
		logger.trace("clear()")
		this._dirty = true;
		this.output.flip();
	}

	say(text: string) {
		logger.trace("say({})", text)
		this._dirty = true;
		let parsed = this.parser.parse(text);
		this.output.print(parsed);
	}

	choicelist(...choices: ChoiceListData[]) {
		logger.trace("choiceList()")
		this._dirty = true;
		this.buttons = choices.map(c => {
			let callback;
			if ('scene' in c) {
				callback = ((scene) => () => this.play(scene))(c.scene)
			} else {
				callback = () => c.call(this);
			}
			return {
				clear: c.clear ?? false,
				label: c.label,
				default: c.default ?? false,
				hotkey: c.hotkey,
				value: 'value' in c ? c.value : c.label,
				disabled: c.disabled ?? false,
				callback: callback
			}
		});
	}

	choices(choices: Record<string, ChoiceData | SceneFn | string>) {
		this._dirty = true;
		this.choicelist(...Object.entries(choices).map(([k, v]) => {
			if (typeof v === 'function') {
				return {label:k, call: v}
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
		logger.trace("next({})", sceneId);
		this._dirty = true;
		this.choicelist({
			label,
			default: true,
			clear,
			scene: sceneId
		})
	}

	endScene({value, label = "END"}: { value?: string, label?: string } = {}) {
		logger.info("endScene({})", value ?? '')
		this._dirty = true;
		if (this._ended) {
			throw new Error("Duplicate endScene call");
		}
		this.lastValue = value ?? this.lastValue ?? '';
		this.choicelist({
			label: label,
			call: ()=>{
				this.finish().then();
			}
		})
	}

	async battleAndContinue(...enemies:Creature[]):Promise<BattleContext> {
		logger.info("battleAndContinue({})", ...enemies);
		let ctx = this.gc.startBattle(enemies);
		return ctx.promise
	}

	endAndBattle(...enemies:Creature[]) {
		logger.info("endAndBattle({})", ...enemies);
		this.endScene({label:"FIGHT"})
		this.promise.then(()=>{
			this.gc.startBattle(enemies);
		})
	}
}
