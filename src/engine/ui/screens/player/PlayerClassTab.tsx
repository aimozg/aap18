import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {Fragment, h, VNode} from "preact";

export class PlayerClassTab extends AbstractPlayerScreenTab {
	label = "Class"

	node(): VNode {
		/* TODO unhardcode */
		let levelData = [
			{level: 1, className:"Warrior"},
			{level: 6},
			{level: 12},
			{level: 18},
			{level: 24},
		]
		return <Fragment>
			<h3>Character Classes</h3>
			{/*<div className="help-block">TODO display actual classes and class selection menu</div>*/}
			<div class="d-grid gap-4-2" style="grid-template-columns: min-content 1fr">
				{levelData.map(ld => <Fragment>
					<div className="text-lg text-center"><span className="text-s">Lv</span>{ld.level}</div>
					<div className={"text-lg"+(ld.className?" text-hl":"")}>{ld.className??"—"}</div>
				</Fragment>)}
			</div>
		</Fragment>
	}
}
