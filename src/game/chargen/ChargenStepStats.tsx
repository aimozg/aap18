import {Fragment, h, VNode} from "preact";
import {simpleparse} from "../../engine/text/utils";
import {Button} from "../../engine/ui/components/Button";
import {CGPCData, CGStat, secondaryStats} from "./chargenData";
import {ChargenStep} from "./ChargenStep";

export class ChargenStepStats extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
	}

	label: string = "Stats";

	complete(): boolean {
		return true;
	}

	private getStat(stat: CGStat): number {
		return stat.get(this.player);
	}

	private canUpSecondary(stat: CGStat):boolean {
		let x = stat.getNatural(this.player);
		if (x >= stat.max) return false;
		return true;
	}
	private canDownSecondary(stat: CGStat):boolean {
		let x = stat.getNatural(this.player);
		if (x <= stat.min) return false;
		return true;
	}
	private upSecondary(stat: CGStat) {
		stat.inc(this.player);
		this.onUpdate();
	}

	private downSecondary(stat: CGStat) {
		stat.dec(this.player);
		this.onUpdate();
	}

	node(): VNode {
		return <Fragment>
			<div class="d-grid gap-2" style="grid-template-columns: max-content max-content max-content 1fr">
				<h3 class="col-span-4">
					Secondary stats
				</h3>
				{secondaryStats.map(ss => <Fragment>
					<div>{ss.label}</div>
					<div style="min-width:2rem" class="text-center">{this.getStat(ss)>=0?'\xA0':''}{this.getStat(ss)}</div>
					<div>
						<Button disabled={!this.canUpSecondary(ss)}
						        hold
						        onClick={() => this.upSecondary(ss)}
						        label="+"/>
						<Button disabled={!this.canDownSecondary(ss)}
						        hold
						        onClick={() => this.downSecondary(ss)}
						        label="-"/>
					</div>
					<div>{simpleparse(ss.explain(this.player))}</div>
				</Fragment>)}
				<div class="col-span-4">
					<i>These stats are not beneficial, you can leave them unchanged.</i>
				</div>
			</div>
		</Fragment>;
	}

}
