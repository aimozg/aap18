/*
 * Created by aimozg on 30.07.2022.
 */
import {DomComponent} from "../DomComponent";
import {createRef, h, render} from "preact";
import {BattleContext} from "../../combat/BattleContext";
import {Button} from "../components/Button";
import {CombatAction} from "../../combat/CombatAction";
import {KeyCodes} from "../KeyCodes";
import {GlyphCanvas} from "../components/GlyphCanvas";

export interface BattleActionButton {
	disabled?: boolean;
	label: string;
	hotkey?: string;
	callback: () => void;
}

export class BattlePanel extends DomComponent {
	private readonly refMain
	private readonly refActions
	private canvas:GlyphCanvas
	constructor(public context: BattleContext) {
		let refMain = createRef<HTMLCanvasElement>()
		let refActions = createRef<HTMLDivElement>()
		super(
			<div className="combat-panel d-flex flex-column">
				<div className="combat-main d-flex flex-grow-1 jc-stretch">
					<canvas className="flex-grow-1" ref={refMain}/>
				</div>
				<div className="combat-actions d-flex gap-1" ref={refActions}>
				</div>
			</div>
		);
		this.refMain = refMain;
		this.refActions = refActions;
		this.canvas = new GlyphCanvas(refMain.current!!.getContext("2d")!!, "fit")
	}
	init() {
		this.canvas.windowWidth = this.context.grid.width;
		this.canvas.windowHeight = this.context.grid.height;
	}

	private hotkey(action:CombatAction<any>, index:number):string|undefined {
		if (index in KeyCodes.DefaultHotkeys) return KeyCodes.DefaultHotkeys[index];
		return undefined;
	}
	private buttons: BattleActionButton[] = []
	update(actions: CombatAction<any>[]) {
		this.buttons = actions.map((action,index)=>({
			label: action.label,
			disabled: !action.isPossible(this.context.cc),
			hotkey: this.hotkey(action,index),
			callback: ()=>this.context.execAction(action)
		}));
		this.canvas.render(this.context.grid);
		render(this.buttons.map(btn =>
			<Button label={btn.label}
			        hotkey={btn.hotkey}
			        onClick={btn.callback}
			        disabled={btn.disabled}/>
		), this.refActions.current!)
	}
	onKeyboardEvent(event: KeyboardEvent) {
		let hk = KeyCodes.eventToHkString(event);
		let btn = this.buttons.find(b=>!b.disabled && b.hotkey === hk);
		if (btn) {
			event.preventDefault();
			btn.callback();
		}
	}
}

