import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {h, VNode} from "preact";
import {Appearance} from "../../../../game/data/text/Appearance";

export class PlayerBodyTab extends AbstractPlayerScreenTab {
	label = "Body"

	node(): VNode {
		return <div>
			<h3>Body</h3>
			{/*<div class="help-block">TODO display structured player body data</div>*/}
			{Appearance.characterAppearance(this.player)}
		</div>
	}
}
