import {DomComponent} from "../DomComponent";
import {BattleContext} from "../../combat/BattleContext";
import {createRef, h, RefObject, render} from "preact";
import {CombatAction} from "../../combat/CombatAction";
import {KeyCodes} from "../KeyCodes";
import {Button, execUIAction, UIAction, uiActionEnabled} from "../components/Button";

export class BattleActionsPanel extends DomComponent {
	private readonly refDPad: RefObject<HTMLDivElement>
	private readonly refStarred: RefObject<HTMLDivElement>
	private readonly refActions: RefObject<HTMLDivElement>
	static DPadHotkeys = [
		[KeyCodes.KEYQ, KeyCodes.NUMPAD7],
		[KeyCodes.KEYW, KeyCodes.NUMPAD8],
		[KeyCodes.KEYE, KeyCodes.NUMPAD9],
		[KeyCodes.KEYA, KeyCodes.NUMPAD4],
		[KeyCodes.ENTER, KeyCodes.NUMPAD5],
		[KeyCodes.KEYD, KeyCodes.NUMPAD6],
		[KeyCodes.KEYZ, KeyCodes.NUMPAD1],
		[KeyCodes.KEYS, KeyCodes.KEYX, KeyCodes.NUMPAD2],
		[KeyCodes.KEYC, KeyCodes.NUMPAD3],
	];

	constructor(public readonly context: BattleContext) {
		let refDPad = createRef<HTMLDivElement>()
		let refStarred = createRef<HTMLDivElement>()
		let refActions = createRef<HTMLDivElement>()
		super(<div className="combat-actions d-flex flex-column gap-4">
			<div class="combat-dpad grid-3 grid-v3" ref={refDPad}>
			</div>
			<div class="combat-actions-starred grid-2 hidden" ref={refStarred}>
				<Button hotkey={KeyCodes.DIGIT1}>Favourite 1</Button>
				<Button hotkey={KeyCodes.DIGIT2}>Favourite 2</Button>
				<Button hotkey={KeyCodes.DIGIT3}>Favourite 3</Button>
				<Button hotkey={KeyCodes.DIGIT4}>Favourite 4</Button>
				<Button hotkey={KeyCodes.DIGIT5}>Favourite 5</Button>
				<Button hotkey={KeyCodes.DIGIT6}>Favourite 6</Button>
				<Button hotkey={KeyCodes.DIGIT7}>Favourite 7</Button>
				<Button hotkey={KeyCodes.DIGIT8}>Favourite 8</Button>
				<Button hotkey={KeyCodes.DIGIT9}>Favourite 9</Button>
				<Button hotkey={KeyCodes.DIGIT0}>Favourite 10</Button>
			</div>
			<div class="combat-actions-list d-flex flex-wrap gap-1" ref={refActions}>

			</div>
		</div>);
		this.refDPad = refDPad;
		this.refStarred = refStarred;
		this.refActions = refActions;
	}

	private hotkey(action: CombatAction<any>, index: number): string | undefined {
		if (index in KeyCodes.DefaultHotkeys) return KeyCodes.DefaultHotkeys[index];
		return undefined;
	}

	private actions: UIAction[] = [];

	update(actions: CombatAction<any>[]) {
		// TODO group actions and favourites
		let actionList:UIAction[] = [];
		let dpadActions:(UIAction|undefined)[] = Array(9).fill(undefined);
		this.actions = [];

		for (let a of actions) {
			let enabled = a.isPossible(this.context.cc);
			if (a.direction) {
				let dirid = a.direction.id;
				let old = dpadActions[dirid];
				let oldEnabled = old && uiActionEnabled(old);
				if (!old || enabled && !oldEnabled) {
					dpadActions[dirid] = {
						hotkeys: BattleActionsPanel.DPadHotkeys[dirid],
						label: a.dpadClass ? <span class={a.dpadClass}>{a.dpadLabel}</span> : a.dpadLabel,
						// TODO tooltip
						disabled: () => !a.isPossible(this.context.cc),
						callback: () => this.context.execAction(a)
					}
					continue
				}
				if (!enabled) {
					// If multiple actions on same directions, do not show disabled
					continue
				}
			}
			actionList.push({
				hotkey: KeyCodes.DefaultHotkeys[actionList.length],
				label: a.label,
				// TODO tooltip
				disabled: () => !a.isPossible(this.context.cc),
				callback: () => this.context.execAction(a)
			})
		}
		this.actions = [
			...(dpadActions.filter(a=>!!a) as UIAction[]),
			...actionList
		];

		render(dpadActions.map((a,i)=>
			a
				? <Button action={a} className="-big"/>
				: <Button className="-big" disabled={true} hotkey={BattleActionsPanel.DPadHotkeys[i][0]}/>
		), this.refDPad.current!);

		render(actionList.map(btn =>
			<Button action={btn}/>
		), this.refActions.current!)
	}

	onKeyboardEvent(event: KeyboardEvent) {
		execUIAction(event, this.actions);
	}
}
