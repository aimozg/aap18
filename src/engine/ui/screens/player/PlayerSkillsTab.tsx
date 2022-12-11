import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {Fragment, h, VNode} from "preact";
import {numberOfThings} from "../../../text/utils";
import {Skills} from "../../../../game/data/skills";
import {Game} from "../../../Game";
import {Button} from "../../components/Button";
import {AttrMetadata} from "../../../../game/data/stats";
import {signValue} from "../../../utils/math";

export class PlayerSkillsTab extends AbstractPlayerScreenTab {
	get label() {
		if (this.canLevelUp && this.player.skillPoints > 0) return <div class="d-ib text-nowrap">
			Skills<span class="d-ib text-hl text-xs"
			                style="transform: translate(0, -33%)">(+{this.player.skillPoints})</span>
		</div>
		return "Skills"
	}

	node(): VNode {
		return <Fragment>
			<h3>Skills</h3>
			<p>
				You have {numberOfThings(this.player.skillPoints, "skill point", "skill points")}. Maximum skill level
				is {this.player.maxNaturalSkill}.
			</p>
			<div class="d-grid ai-start gap-2" style="grid-template-columns: repeat(8, max-content) 1fr">
				<div className="th">Skill</div>
				<div className="th cols-2">Natural</div>
				<div className="th cols-2">Attribute</div>
				<div className="th">Buffs</div>
				<div className="th cols-2">Total</div>
				<div className="th">Description</div>

				{Game.instance.data.skills.values().map(skill => <Fragment>
					<div className="text-hl">{skill.name}</div>
					<div>
						{this.player.naturalSkillValue(skill)}{this.player.naturalSkillValue(skill) < this.player.maxNaturalSkill &&
                        <span
                            className="text-xs">,{(this.player.skillXp(skill) / this.player.nextSkillLevelXp(skill)).format('02d%')}</span>}
					</div>
					{this.canLevelUp
						? <Button disabled={!this.screen.canIncSkill(skill)}
						          onClick={() => this.screen.incSkill(skill)}
						          label="+"/>
						: <div/>
					}
					{skill.attr >= 0
						? <Fragment>
							<div>({AttrMetadata[skill.attr].abbr})</div>
							<div className={"text-center "+signValue(this.player.attrMod(skill.attr),'text-negative','','text-positive')}>{this.player.attrMod(skill.attr).signed()}</div>
						</Fragment>
						: <div className="cols-2"></div>
					}
					<div className="text-center">+0{/* TODO */}</div>
					<div>=</div>
					<div className="text-center">{this.player.skillValue(skill).signed()}</div>
					<div>{skill.description}</div>
				</Fragment>)}
			</div>
		</Fragment>
	}
}
