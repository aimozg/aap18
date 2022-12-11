import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {Fragment, h, VNode} from "preact";
import {CreaturePanel} from "../../panels/CreaturePanel";

export class PlayerStatsTab extends AbstractPlayerScreenTab {
	label = "Stats"

	node(): VNode {
		// TODO display more detailed data in 2-3 columns
		let panel = new CreaturePanel(this.player, { cssclass:"-noborder", collapsible: false });
		panel.update();
		return <Fragment>
			<h3>Stats</h3>
			{/*<div className="help-block">TODO display more detailed data</div>*/}
			{panel.astsx}
		</Fragment>
	}
}


