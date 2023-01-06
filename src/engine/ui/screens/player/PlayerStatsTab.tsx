import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {h, VNode} from "preact";
import {CreaturePanel} from "../../panels/CreaturePanel";
import {LevelRules} from "../../../rules/LevelRules";
import {Button} from "../../components/Button";

export class PlayerStatsTab extends AbstractPlayerScreenTab {
	get label() {
		return <div class="d-ib text-nowrap">
			Stats{this.interactive && this.player.canLevelUpNow() && <span class="text-focus-blink text-elevated">(+)</span>}
		</div>
	}

	node(): VNode {
		// TODO display more detailed data in 2-3 columns
		return <div>
			<h3>
				Stats
			</h3>
			<p>
				<label> Level:</label> {this.player.level}
				{this.interactive && this.player.canLevelUpNow() &&
                    <Button className="ml-8 -link" onClick={() => this.screen.levelUp()}>LEVEL UP</Button>}
				<br/>
				<label>XP:</label>
				<span className={this.player.level >= LevelRules.MaxLevel ? "text-maxlevel" :
					this.player.canLevelUpNow() ? "text-levelup" : ""}>{this.player.xp}{isFinite(this.player.nextLevelXp()) && ('/' + this.player.nextLevelXp())}</span>
				<br/>
			</p>
			{/*<div className="help-block">TODO display more detailed data</div>*/}
			<div>
				<CreaturePanel creature={this.player} options={{cssclass:"-noborder", collapsible:false}}/>
			</div>
		</div>
	}
}


