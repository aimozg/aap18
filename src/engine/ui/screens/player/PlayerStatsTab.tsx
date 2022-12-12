import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {Fragment, h, VNode} from "preact";
import {CreaturePanel} from "../../panels/CreaturePanel";
import {LevelRules} from "../../../rules/LevelRules";
import {Button} from "../../components/Button";

export class PlayerStatsTab extends AbstractPlayerScreenTab {
	label = "Stats"

	node(): VNode {
		// TODO display more detailed data in 2-3 columns
		let panel = new CreaturePanel(this.player, { cssclass:"-noborder", collapsible: false });
		panel.update();
		return <Fragment>
			<h3>Stats</h3>
			<p>
				<label>Level:</label> {this.player.level}
				<br/>
				<label>XP: <span className={this.player.level >= LevelRules.MaxLevel ? "text-maxlevel" :
					this.player.canLevelUpNow() ? "text-levelup" : ""}></span></label>
				{this.interactive && this.player.canLevelUpNow() && <Button className="-link" onClick={()=>this.screen.levelUp()}>Level Up</Button>}
				<br/>
			</p>
			{/*<div className="help-block">TODO display more detailed data</div>*/}
			{panel.astsx}
		</Fragment>
	}
}


