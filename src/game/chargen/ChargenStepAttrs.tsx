/*
 * Created by aimozg on 04.08.2022.
 */

import {ChargenStep} from "./ChargenStep";
import {Fragment, h, VNode} from "preact";
import {Button} from "../../engine/ui/components/Button";
import {simpleparse} from "../../engine/text/utils";
import {ChargenController} from "./ChargenController";
import {TAttribute} from "../../engine/rules/TAttribute";
import {AttrMetadata, IAttrMetadata} from "../data/stats";

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
		return meta.explain(this.player.attrMod(meta.id), this.player.attr(meta.id), this.player);
	}

	node(): VNode {
		return <div class="d-grid gap-2" style="grid-template-columns: max-content max-content max-content 1fr">
			<h3 class="cols-4">
				Attributes
			</h3>
			{AttrMetadata.map(meta => <Fragment>
				<div>{meta.name}</div>
				<div style="min-width:2rem" class="text-center">{this.player.attr(meta.id)}</div>
				<div>
					<Button disabled={!this.cc.canIncAttr(meta.id)}
					        hold
					        onClick={() => this.cc.attrInc(meta.id)}
					        label="+"/>
					<Button disabled={!this.cc.canDecAttr(meta.id)}
					        hold
					        onClick={() => this.cc.attrDec(meta.id)}
					        label="-"/>
				</div>
				<div>({this.getAttrValueName(meta.id)}) {simpleparse(this.explainStat(meta))}</div>
			</Fragment>)}
			<div class="cols-4">
				You have {this.cc.attrPoints} points to allocate.
				You get +1 to any attribute every 4 levels.
			</div>
			<h3 className="cols-4">
				Derived stats
			</h3>

			<div>Fortitude</div>
			<div>{this.player.fortitude}</div>
			<div></div>
			<div>Fortitude saving throw</div>

			<div>Reflex</div>
			<div>{this.player.reflex}</div>
			<div></div>
			<div>Reflex saving throw</div>

			<div>Will</div>
			<div>{this.player.will}</div>
			<div></div>
			<div>Will saving throw</div>

			<div>Max Health</div>
			<div>{this.player.hpMax}</div>
			<div></div>
			<div>Your character is knocked out when it reaches zero.</div>

			<div>Max Energy</div>
			<div>{this.player.epMax}</div>
			<div></div>
			<div>Universal resource for special abilities.</div>

			<div>Max Lust</div>
			<div>{this.player.lpMax}</div>
			<div></div>
			<div>When lust reaches maximum, your character might willingly surrender.</div>
		</div>
	}

}
