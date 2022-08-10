import {Fragment, h, VNode} from "preact";
import {simpleparse} from "../../engine/text/utils";
import {Button} from "../../engine/ui/components/Button";
import {ChargenStep} from "./ChargenStep";
import {ChargenController} from "./ChargenController";

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
			<div class="d-grid gap-2" style="grid-template-columns: repeat(5, max-content) 1fr">
				<h3 class="col-span-6">
					Secondary stats
				</h3>

				{this.cc.secondaryStats().map(ss => <Fragment>
					<div>{ss.meta.name}</div>
					<Button disabled={!this.cc.canIncStat(ss)}
					        hold
					        onClick={() => this.cc.statInc(ss)}
					        label="+"/>
					<div style="min-width:2rem" class="text-center">({ss.natural})</div>
					<Button disabled={!this.cc.canDecStat(ss)}
						        hold
						        onClick={() => this.cc.statDec(ss)}
						        label="-"/>
					<div style="min-width:2rem" className={"text-center"+(ss.total>ss.natural?' text-positive':ss.total<ss.natural?' text-negative':'')}>{ss.total>=0?'\xA0':''}{ss.total}</div>
					<div>{simpleparse(ss.meta.explain(ss.total,this.player))}</div>
				</Fragment>)}
				<div class="col-span-6">
					<i>These stats are not beneficial, you can leave them unchanged.</i>
				</div>
			</div>
		</Fragment>;
	}

}
