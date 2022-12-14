import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {h, VNode} from "preact";

export class PlayerPerksTab extends AbstractPlayerScreenTab {
	get label() {
		return <div class="d-ib text-nowrap">
			Perks{this.interactive && this.player.perkPoints > 0 && <span class="text-hl text-elevated">(+{this.player.perkPoints})</span>}
		</div>
	}

	node(): VNode {
		return <div>
			<h3>Perks</h3>
			<div className="help-block">TODO This tab is not implemented yet. {/*List owned perks and new perk menu*/}</div>
		</div>
	}
}
