import {Fragment, h, VNode} from "preact";
import {Button} from "../ui/components/Button";
import {ChargenStep} from "./ChargenStep";
import {ChargenController} from "./ChargenController";
import {Parse} from "../text/ParseTag";
import {signValue} from "../utils/math";

export class ChargenStepStats extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Stats";

	complete(): boolean {
		return true;
	}

	node(): VNode {
		return <Fragment>
			<div class="d-grid gap-2" style="grid-template-columns: repeat(6, max-content) 1fr">
				<h3 class="cols-7">
					Secondary stats
				</h3>

				<b className="text-center">Name</b>
				<b className="cols-3 text-center">Natural</b>
				<b></b>
				<b className="text-center">Total</b>
				<b className="text-center">Description</b>

				{this.cc.secondaryStats().map(ss => <Fragment>
					<div class="text-hl">{ss.meta.name}</div>
					<Button disabled={!this.cc.canDecStat(ss)}
					        hold
					        onClick={() => this.cc.statDec(ss)}
					        label="-"/>
					<div style="min-width:2rem" className="text-center">({ss.natural})</div>
					<Button disabled={!this.cc.canIncStat(ss)}
					        hold
					        onClick={() => this.cc.statInc(ss)}
					        label="+"/>
					<div>=</div>
					<div style="min-width:2rem" class={"text-center mx-2" + signValue(ss.total-ss.natural, ' text-negative', '', ' text-positive')}>
						{ss.total >= 0 ? '\xA0' : ''}{ss.total}</div>
					<div>
						<Parse>{ss.meta.explain(ss.total, this.player)}</Parse>
					</div>
				</Fragment>)}
				<div class="cols-7">
					<i>These stats are not beneficial, you can leave them unchanged.</i>
				</div>
			</div>
		</Fragment>;
	}

}
