import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {h, VNode} from "preact";

export class PlayerPerksTab extends AbstractPlayerScreenTab {
	label = "Perks"

	node(): VNode {
		return <div>
			<h3>Perks</h3>
			<div className="help-block">TODO This tab is not implemented yet. {/*List owned perks and new perk menu*/}</div>
		</div>
	}
}
