import {Fragment, h, VNode} from "preact";
import {simpleparse} from "../../engine/text/utils";
import {Button} from "../../engine/ui/components/Button";
import {CGPCData, CGStat, ChargenRules, primaryStats, secondaryStats} from "./chargenData";
import {ChargenStep} from "./ChargenStep";

export class ChargenStepStats extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
	}

	label: string = "Stats";

	complete(): boolean {
		return this.pcdata.ppoints === 0 || true;
	}

	private getStat(stat: CGStat): number {
		return stat.get(this.player);
	}
	private getStatValueName(stat: CGStat): string {
		let x = stat.getNatural(this.player);
		switch (x) {
			case 0: return "Non-existant"
			case 1: return "Trash"
			case 2: return "Terrible"
			case 3: return "Bad"
			case 4: return "Poor"
			case 5: return "Average"
			case 6: return "Decent"
			case 7: return "Good"
			case 8: return "Great"
			case 9: return "Excellent"
			case 10: return "Superb"
			default: return "Superb"
		}
	}

	private upCost(stat: CGStat): number {
		let x = stat.getNatural(this.player);
		if (x >= 14) return 5;
		if (x >= 12) return 4;
		if (x >= 10) return 3;
		if (x >= 8) return 2;
		return 1;
	}

	private canUpPrimary(stat: CGStat): boolean {
		return stat.getNatural(this.player) < ChargenRules.maxPrimaryStat &&
			this.pcdata.ppoints >= this.upCost(stat);
	}

	private canDownPrimary(stat: CGStat): boolean {
		return stat.getNatural(this.player) > ChargenRules.minPrimaryStat;
	}

	private upPrimary(stat: CGStat) {
		this.pcdata.ppoints -= this.upCost(stat);
		stat.inc(this.player);
		this.onUpdate();
	}

	private downPrimary(stat: CGStat) {
		stat.dec(this.player);
		this.pcdata.ppoints += this.upCost(stat);
		this.onUpdate();
	}

	private canUpSecondary(stat: CGStat):boolean {
		let x = stat.getNatural(this.player);
		if (x >= stat.max) return false;
		if (x >= 0) return this.pcdata.spoints > 0;
		return true;
	}
	private canDownSecondary(stat: CGStat):boolean {
		let x = stat.getNatural(this.player);
		if (x <= stat.min) return false;
		if (x <= 0) return this.pcdata.spoints > 0;
		return true;
	}
	private upSecondary(stat: CGStat) {
		if (stat.getNatural(this.player) >= 0) this.pcdata.spoints--;
		else this.pcdata.spoints++;
		stat.inc(this.player);
		this.onUpdate();
	}

	private downSecondary(stat: CGStat) {
		if (stat.getNatural(this.player) > 0) this.pcdata.spoints++;
		else this.pcdata.spoints--;
		stat.dec(this.player);
		this.onUpdate();
	}

	node(): VNode {
		return <Fragment>
			<div class="d-grid gap-2" style="grid-template-columns: max-content max-content max-content 1fr">
				<h3 class="col-span-4">
					Attributes
				</h3>
				{primaryStats.map(ps => <Fragment>
					<div>{ps.label}</div>
					<div style="min-width:2rem" class="text-center">{this.getStat(ps)}</div>
					<div>
						<Button disabled={!this.canUpPrimary(ps)}
						        hold
						        onClick={() => this.upPrimary(ps)}
						        label="+"/>
						<Button disabled={!this.canDownPrimary(ps)}
						        hold
						        onClick={() => this.downPrimary(ps)}
						        label="-"/>
					</div>
					<div>({this.getStatValueName(ps)}) {simpleparse(ps.explain(this.player))}</div>
				</Fragment>)}
				<div class="col-span-4">
					You have {this.pcdata.ppoints} points to allocate.
					You get +1 to any attribute every 4 levels.
				</div>
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
					You can spend {this.pcdata.spoints} points.<br/>
					<i>These stats are not beneficial, you can leave them unchanged.</i>
				</div>
				<h3 class="col-span-4">
					Derived stats
				</h3>

				<div>Fortitude</div>
				<div>xxx</div>
				<div></div>
				<div>Fortitude saving throw</div>

				<div>Reflex</div>
				<div>xxx</div>
				<div></div>
				<div>Reflex saving throw</div>

				<div>Will</div>
				<div>xxx</div>
				<div></div>
				<div>Will saving throw</div>

				<div>Max Health</div>
				<div>xxx</div>
				<div></div>
				<div>Your character is knocked out when it reaches zero.</div>

				<div>Max Energy</div>
				<div>xxx</div>
				<div></div>
				<div>Universal resource for special abilities.</div>

				<div>Max Lust</div>
				<div>xxx</div>
				<div></div>
				<div>When lust reaches maximum, your character might willingly surrender.</div>
			</div>
		</Fragment>;
	}

}
