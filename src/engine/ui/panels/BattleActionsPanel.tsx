import {DomComponent} from "../DomComponent";
import {BattleContext} from "../../combat/BattleContext";
import {ComponentChildren, createRef, h, RefObject, render} from "preact";
import {CombatAction} from "../../combat/CombatAction";
import {KeyCodes} from "../KeyCodes";
import {Button, execUIAction, UIAction, uiActionEnabled} from "../components/Button";
import {CombatActionGroups} from "../../combat/CombatActionGroups";
import {Fragment} from "preact/compat";
import {removeChildren} from "../../utils/dom";

export class BattleActionsPanel extends DomComponent {
	private readonly refDPad: RefObject<HTMLDivElement>
	private readonly refActions: RefObject<HTMLDivElement>
	private refCurrentGroup: RefObject<HTMLDivElement>|null = null
	private readonly refGroups: RefObject<HTMLDivElement>[] = CombatActionGroups.LIST.map(()=>createRef());
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
	static GroupHotkeys = [
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
	];

	constructor(public readonly context: BattleContext) {
		let refDPad = createRef<HTMLDivElement>()
		let refActions = createRef<HTMLDivElement>()
		super(<div className="combat-actions d-flex flex-column gap-4">
			<div class="combat-dpad grid-3 grid-v3" ref={refDPad}>
			</div>
			<div class="combat-actions-list d-flex flex-column gap-2" ref={refActions}>

			</div>
		</div>);
		this.refDPad = refDPad;
		this.refActions = refActions;
	}

	private hotkey(action: CombatAction<any>, index: number): string | undefined {
		if (index in KeyCodes.DefaultHotkeys) return KeyCodes.DefaultHotkeys[index];
		return undefined;
	}

	private combatActionsGrouped: UIAction[][] = [];
	private allActions: UIAction[] = [];
	private dpadActions: UIAction[] = [];
	private currentGroup = -1
	private actionsOpenGroup: UIAction[] = CombatActionGroups.LIST.map((name,i)=>({
		label: name,
		hotkey: BattleActionsPanel.GroupHotkeys[i],
		disabled: ()=>(this.combatActionsGrouped[i]?.length??0) === 0,
		callback: ()=>this.openActionGroup(i)
	}))

	showFinishBattle() {
		let aFinish:UIAction = {
			label: "Finish",
			tooltip: "Finish battle",
			hotkey: KeyCodes.ENTER,
			callback: ()=>this.context.onBattleFinishClick(),
		}
		this.currentGroup = -1;
		this.allActions = [aFinish];
		removeChildren(this.refActions.current);
		render(<Button action={aFinish} className="-big"/>, this.refDPad.current!)
	}

	private async execAction(a:CombatAction<any>) {
		this.closeActionGroup();
		await this.context.execAction(a);
	}

	private renderDpadActions(dpadActions:(UIAction|undefined)[]) {
		render(dpadActions.map((a,i)=>
			a
				? <Button action={a} className="-big"/>
				: <Button className="-big" disabled={true} hotkey={BattleActionsPanel.DPadHotkeys[i][0]}/>
		), this.refDPad.current!);
	}

	private renderActionGroup(group:string, i:number, actions:UIAction[]): ComponentChildren {
		let hotkey = BattleActionsPanel.GroupHotkeys[i];
		return <Fragment>
			{
				actions.length === 0 && <Button label={group} hotkey={hotkey} disabled={true}/>
			}
			{
				actions.length === 1 && <Button action={actions[0]} hotkey={hotkey}/>
			}
			{
				actions.length > 1 && <Button action={this.actionsOpenGroup[i]}/>
			}
			<div class="combat-actions-sublist mx-4 d-flex flex-wrap gap-1" ref={this.refGroups[i]}/>
		</Fragment>
	}

	private renderActions() {
		render(
			CombatActionGroups.LIST.map((group,i)=>
				this.renderActionGroup(group, i, this.combatActionsGrouped[i]??[])
			), this.refActions.current!)
	}

	openActionGroup(i:number) {
		if (this.currentGroup === i) {
			this.closeActionGroup();
			return;
		}
		this.closeActionGroup();
		let actions = this.combatActionsGrouped[i];
		if (!actions) return;
		if (actions.length === 1) {
			actions[0].callback();
			return;
		}
		this.currentGroup = i;
		this.refCurrentGroup = this.refGroups[i];
		render(
			actions.map(
				a => <Button action={a}/>
			),
		this.refCurrentGroup!.current!)
	}
	closeActionGroup() {
		removeChildren(this.refCurrentGroup?.current)
		this.refCurrentGroup = null
		this.currentGroup = -1
	}

	showActions(actions: CombatAction<any>[], playerCanAct:boolean) {
		// TODO favourites
		this.closeActionGroup();
		this.combatActionsGrouped = [];
		let dpadActions:(UIAction|undefined)[] = Array(9).fill(undefined);
		this.allActions = [];

		for (let a of actions) {
			let groupId = CombatActionGroups.LIST.indexOf(a.group);
			if (groupId >= 0) {
				let group = this.combatActionsGrouped[groupId] ??= [];
				group.push({
					label: a.label,
					hotkey: BattleActionsPanel.GroupHotkeys[group.length],
					tooltip: a.tooltip,
					disabled: () => !playerCanAct || !a.isPossible(this.context.cc),
					callback: () => this.execAction(a)
				});
			}

			if (a.direction) {
				let enabled = a.isPossible(this.context.cc);
				let dirid = a.direction.id;
				let old = dpadActions[dirid];
				let oldEnabled = old && uiActionEnabled(old);
				if (!old || enabled && !oldEnabled) {
					dpadActions[dirid] = {
						hotkeys: BattleActionsPanel.DPadHotkeys[dirid],
						label: a.dpadClass ? <span class={a.dpadClass}>{a.dpadLabel}</span> : a.dpadLabel,
						tooltip: a.tooltip,
						disabled: () => !playerCanAct || !a.isPossible(this.context.cc),
						callback: () => this.execAction(a)
					}
				} else if (enabled && oldEnabled) {
					(this.combatActionsGrouped[CombatActionGroups.LIST.indexOf(CombatActionGroups.AGOther)] ??= []).push({
						label: a.label,
						disabled: () => !playerCanAct || !a.isPossible(this.context.cc),
						callback: () => this.execAction(a)
					})
				}
			}
		}
		this.allActions = [
			...(dpadActions.filter(a=>!!a) as UIAction[]),
			...this.actionsOpenGroup
		];

		this.renderDpadActions(dpadActions);
		this.renderActions();
	}

	onKeyboardEvent(event: KeyboardEvent) {
		if (this.currentGroup >= 0) {
			if (execUIAction(event, this.combatActionsGrouped[this.currentGroup])) return
		}
		execUIAction(event, this.allActions);
	}
}
