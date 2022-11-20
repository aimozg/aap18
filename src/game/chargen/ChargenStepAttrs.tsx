/*
 * Created by aimozg on 04.08.2022.
 */

import {ChargenStep} from "./ChargenStep";
import {Fragment, h, VNode} from "preact";
import {Button} from "../../engine/ui/components/Button";
import {ChargenController} from "./ChargenController";
import {TAttribute} from "../../engine/rules/TAttribute";
import {AttrMetadata, IAttrMetadata} from "../data/stats";
import {Parse} from "../../engine/text/ParseTag";
import {Game} from "../../engine/Game";

export class ChargenStepAttrs extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label = "Attributes"

	complete(): boolean {
		return this.cc.attrPoints === 0;
	}
	private getAttrValueName(attr: TAttribute): string {
		// TODO move somewhere else
		let x = this.player.attr(attr);
		switch (x) {
			case 0:
				return "Non-existant"
			case 1:
				return "Trash"
			case 2:
				return "Terrible"
			case 3:
				return "Bad"
			case 4:
				return "Poor"
			case 5:
				return "Average"
			case 6:
				return "Decent"
			case 7:
				return "Good"
			case 8:
				return "Great"
			case 9:
				return "Excellent"
			case 10:
				return "Superb"
			default:
				return "Superb"
		}
	}
	private explainStat(meta: IAttrMetadata):string {
		let skills = Game.instance.data.skills.values().filter(skill=>skill.attr===meta.id);
		let s = meta.explain(this.player.attrMod(meta.id), this.player.attr(meta.id), this.player);
		if (skills.length > 0) {
			s += " "+this.player.attrMod(meta.id).signed()+" to "+skills.map(skill=>skill.name).join(", ")+".";
		}
		return s;
	}

	node(): VNode {
		return <div class="d-grid ai-start gap-2" style="grid-template-columns: repeat(5, max-content) 1fr">
			<h3 class="cols-6">
				Attributes
			</h3>

			<b class="text-center">Name</b>
			<b class="cols-3 text-center">Value</b>
			<b></b>
			<b class="text-center">Description</b>

			{AttrMetadata.map(meta => <Fragment>
				<div class="text-hl">{meta.name}</div>
				<Button disabled={!this.cc.canDecAttr(meta.id)}
				        hold
				        onClick={() => this.cc.attrDec(meta.id)}
				        label="-"/>
				<div style="min-width:2rem" class="text-center">{this.player.attr(meta.id)}</div>
				<Button disabled={!this.cc.canIncAttr(meta.id)}
				        hold
				        onClick={() => this.cc.attrInc(meta.id)}
				        label="+"/>
				<div class="mx-2">{this.getAttrValueName(meta.id)}</div>
				<div><Parse>{meta.description}<br/>{this.explainStat(meta)}</Parse></div>
			</Fragment>)}
			<div class="cols-6">
				You have {this.cc.attrPoints} points to allocate.
				You get +1 to the attribute of your choice every 4 levels.
			</div>
			<h3 className="cols-6">
				Derived stats
			</h3>

			<div class="text-hl">Fortitude</div>
			<div></div>
			<div class="text-center">{this.player.fortitude}</div>
			<div></div>
			<div class="cols-2">Fortitude saving throw. Fortitude threats include poisons and diseases.</div>

			<div class="text-hl">Reflex</div>
			<div></div>
			<div class="text-center">{this.player.reflex}</div>
			<div></div>
			<div class="cols-2">Reflex saving throw. Reflex threats include traps and projectiles.</div>

			<div class="text-hl">Will</div>
			<div></div>
			<div class="text-center">{this.player.willpower}</div>
			<div></div>
			<div class="cols-2">Will saving throw. Will threats include seduction and mind control.</div>

			<div class="text-hl">Max Health</div>
			<div></div>
			<div class="text-center">{this.player.hpMax}</div>
			<div></div>
			<div class="cols-2">Your character is knocked out when it reaches zero.</div>

			<div class="text-hl">Max Energy</div>
			<div></div>
			<div class="text-center">{this.player.epMax}</div>
			<div></div>
			<div class="cols-2">Universal resource for special abilities.</div>

			<div class="text-hl">Max Lust</div>
			<div></div>
			<div class="text-center">{this.player.lpMax}</div>
			<div></div>
			<div class="cols-2">Having high Lust imposes a stat penalty and Seduction vulnerability.</div>
		</div>
	}

}
