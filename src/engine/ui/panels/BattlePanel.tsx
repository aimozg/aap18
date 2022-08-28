/*
 * Created by aimozg on 30.07.2022.
 */
import {DomComponent} from "../DomComponent";
import {createRef, h, render} from "preact";
import {BattleContext} from "../../combat/BattleContext";
import {Button} from "../components/Button";
import {CombatAction} from "../../combat/CombatAction";
import {KeyCodes} from "../KeyCodes";

export interface BattleActionButton {
	disabled?: boolean;
	label: string;
	hotkey?: string;
	callback: () => void;
}

export class BattlePanel extends DomComponent {
	private readonly refMain
	private readonly refActions
	constructor(public context: BattleContext) {
		let refMain = createRef<HTMLDivElement>()
		let refActions = createRef<HTMLDivElement>()
		super(
			<div className="combat-panel d-flex flex-column">
				<div className="combat-main flex-grow-1" ref={refMain}></div>
				<div className="combat-actions d-flex gap-1" ref={refActions}>
				</div>
			</div>
		);
		this.refMain = refMain;
		this.refActions = refActions;
	}

	static Hotkeys = [
		KeyCodes.DIGIT1,
		KeyCodes.DIGIT2,
		KeyCodes.DIGIT3,
		KeyCodes.DIGIT4,
		KeyCodes.DIGIT5,
		KeyCodes.DIGIT6,
		KeyCodes.DIGIT7,
		KeyCodes.DIGIT8,
		KeyCodes.DIGIT9,
		KeyCodes.DIGIT0,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT1,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT2,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT3,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT4,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT5,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT6,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT7,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT8,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT9,
		KeyCodes.HOTKEY_PREFIX_SHIFT+KeyCodes.DIGIT0,
	]
	private hotkey(action:CombatAction<any>, index:number):string|undefined {
		if (index in BattlePanel.Hotkeys) return BattlePanel.Hotkeys[index];
		return undefined;
	}
	private buttons: BattleActionButton[] = []
	update(actions: CombatAction<any>[]) {
		this.buttons = actions.map((action,index)=>({
			label: action.label,
			disabled: !action.isPossible(),
			hotkey: this.hotkey(action,index),
			callback: ()=>this.context.execAction(action)
		}));
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

