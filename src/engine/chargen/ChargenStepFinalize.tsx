import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {Parser} from "../text/parser/Parser";
import {Appearance} from "../../game/data/text/Appearance";
import {ChargenController} from "./ChargenController";
import {CreaturePanel} from "../ui/panels/CreaturePanel";
import {Parse} from "../text/ParseTag";

export class ChargenStepFinalize extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Finalize";
	panel = new CreaturePanel(null, {collapsible:false});

	complete(): boolean {
		return false;
	}

	node(): VNode {
		let pc = this.player;
		let parser = new Parser(pc);
		this.panel.creature = pc;
		return <Fragment>
			<h3>Review</h3>
			<div class="grid-12 gap-4">
				<div class="cols-6">
					<p>
						You will play as <b>{pc.origin.shortDesc}, {pc.name} the {pc.txt.sex} {this.cc.race} {this.cc.classObject!.name.capitalize()}.</b>
					</p>
					<h5>Perks</h5>
					{pc.perks.size === 0 && "(No strating perks)"}
					{pc.perkList().map(t=><div>
						<b>{t.name}</b> &ndash; <Parse>{t.description(pc)}</Parse>
					</div>)}
					<h5>Appearance</h5>
					{Appearance.characterAppearance(pc, parser)}
				</div>
				<div class="cols-6">
					{this.panel.astsx}
				</div>
			</div>
		</Fragment>;
	}

}
