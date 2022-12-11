import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {h, VNode} from "preact";

export class PlayerRaceTab extends AbstractPlayerScreenTab {
	label = "Race"

	node(): VNode {
		return <div>
			<h3>Race</h3>
			<div className="help-block">TODO This tab is not implemented yet. Racial scores, bonuses etc</div>
		</div>
	}
}
