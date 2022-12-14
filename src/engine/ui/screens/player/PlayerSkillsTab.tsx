import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {Fragment, h, VNode} from "preact";
import {numberOfThingsStyled} from "../../../text/utils";
import {Button} from "../../components/Button";
import {AttrMetadata} from "../../../../game/data/stats";
import {signClass} from "../../../utils/math";

export class PlayerSkillsTab extends AbstractPlayerScreenTab {
	get label() {
		return <div class="d-ib text-nowrap">
			Skills{this.interactive && this.player.skillPoints > 0 && <span class="text-focus-blink text-elevated">(+{this.player.skillPoints})</span>}
		</div>
	}

	node(): VNode {
		return <Fragment>
			<h3>Skills</h3>
			<p>
				You have {numberOfThingsStyled("text-hl", "", this.player.skillPoints, "skill point")}. Maximum skill level
				is <span class="text-hl">{this.player.maxNaturalSkill}</span>.
			</p>
			<div class="d-igrid ai-start gap-2 text-center" style="grid-template-columns: repeat(8, max-content) 1fr">
				<div className="th">Skill</div>
				<div className="th cols-2">Natural</div>
				<div className="th cols-2">Attribute</div>
				<div className="th">Buffs</div>
				<div className="th cols-2">Total</div>
				<div className="th">Description</div>

				{this.player.skills().map(skill => <Fragment>
					<div className="text-hl text-left">{skill.name}</div>
					<div class="text-right">
						{skill.naturalLevel}<span className="text-xs">,{skill.isMaxed ? '00' : skill.xpProgress.format('02d%')}</span>
					</div>
					{this.interactive
						? <Button disabled={!this.screen.canIncSkill(skill)}
						          onClick={() => this.screen.incSkill(skill)}
						          label="+"/>
						: <div/>
					}
					{skill.attr >= 0
						? <Fragment>
							<div>({AttrMetadata[skill.attr].abbr})</div>
							<div className={signClass(skill.attrBonus)}>{skill.attrBonus.signed()}</div>
						</Fragment>
						: <div className="cols-2"></div>
					}
					<div
						className={signClass(skill.miscBonus)}>
						{skill.miscBonus.signed()}{/* TODO tooltip */}
					</div>
					<div>=</div>
					<div>{skill.level}</div>
					<div class="text-left">{skill.description}</div>
				</Fragment>)}
			</div>
		</Fragment>
	}
}
