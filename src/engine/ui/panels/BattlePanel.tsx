/*
 * Created by aimozg on 30.07.2022.
 */
import {DomComponent} from "../DomComponent";
import {createRef, h} from "preact";
import {BattleContext} from "../../combat/BattleContext";
import {Button} from "../components/Button";

export class BattlePanel extends DomComponent {
	private readonly refMain
	private readonly refActions
	constructor(public context:BattleContext) {
		let refMain = createRef<HTMLDivElement>()
		let refActions = createRef<HTMLDivElement>()
		super(
			<div className="combat-panel d-flex flex-column">
				<div className="combat-main flex-grow-1" ref={refMain}></div>
				<div className="combat-actions d-flex gap-1" ref={refActions}>
					<Button onClick={()=>this.attack()}>1. Attack</Button>
				</div>
			</div>
		);
		this.refMain = refMain;
		this.refActions = refActions;
	}

	async attack() {
		if (!this.context.playerCanAct) return;
		await this.context.playerMeleeAttack()
	}
}

