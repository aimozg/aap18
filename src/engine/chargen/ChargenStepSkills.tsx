import {ChargenStep} from "./ChargenStep";
import {h, VNode} from "preact";
import {ChargenController} from "./ChargenController";
import {Fragment} from "preact/compat";
import {Button} from "../ui/components/Button";
import {AttrMetadata} from "../../game/data/stats";
import {signValue} from "../utils/math";

export class ChargenStepSkills extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Skills";

	complete(): boolean {
		return this.cc.skillPointsSpent === this.cc.skillPointsTotal() || this.cc.getUpgradeableSkills().length === 0;
	}

	node(): VNode {
		return <Fragment>
			<h3>Skills</h3>
			<div style={{
				"grid-template-columns": "auto repeat(7, 1fr) auto"
			}} class="d-grid gap-2 ai-start">
				<b class="text-center">Name</b>
				<b class="cols-3 text-center">Natural</b>
				<b class="cols-2 text-center">Attribute</b>
				<b></b>
				<b class="text-center">Total</b>
				<b class="text-center">Description</b>

				{this.cc.allowedSkills().map(skill => <Fragment>
					<div class="text-hl">{skill.name}</div>
					<Button disabled={!this.cc.canDecSkill(skill)}
					        hold
					        onClick={() => this.cc.skillDec(skill)}
					        label="-"/>
					<div style="min-width:2rem" class="text-center">
						{this.cc.skillNatural(skill)}
					</div>
					<Button disabled={!this.cc.canIncSkill(skill)}
					        hold
					        onClick={() => this.cc.skillInc(skill)}
					        label="+"/>
					{skill.attr >= 0
						? <Fragment>
							<div>({AttrMetadata[skill.attr].abbr})</div>
							<div
								className={signValue(this.cc.attrMod(skill.attr), 'text-negative', '', 'text-positive')}>
								{this.cc.attrMod(skill.attr).signed()}
							</div>
						</Fragment>
						: <div className="cols-2"/>
					}

					<div>=</div>
					<div
						class={"mx-2" + signValue(this.cc.skillTotal(skill) - this.cc.skillNatural(skill), ' text-negative', '', ' text-positive')}>
						{this.cc.skillTotal(skill)}
					</div>
					<div>
						{skill.description}
					</div>
				</Fragment>)}

				<div class="cols-2">
					Points:
				</div>
				<div class="text-center">
					{this.cc.skillPointsTotal() - this.cc.skillPointsSpent}
				</div>
				<div class="cols-6"></div>
			</div>
			<p>
				You raise your skills by using them, and with level-up points. Your character level affects your maximum
				skill value.
			</p>

		</Fragment>
	}

}
