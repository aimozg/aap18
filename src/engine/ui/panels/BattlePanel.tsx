/*
 * Created by aimozg on 30.07.2022.
 */
import {DomComponent} from "../DomComponent";
import {createRef, h, render} from "preact";
import {BattleContext} from "../../combat/BattleContext";
import {Button} from "../components/Button";
import {CombatAction} from "../../combat/CombatAction";

export interface BattleActionButton {
	disabled?: boolean;
	label: string;
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

	update(actions: CombatAction<any>[]) {
		render(actions.map(action =>
			<Button label={action.label}
			        onClick={() => this.context.execAction(action)}
			        disabled={!action.isPossible()}/>
		), this.refActions.current)
	}
}

