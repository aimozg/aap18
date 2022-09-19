import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {Parser} from "../../engine/text/parser/Parser";
import {Appearance} from "../data/text/Appearance";
import {ChargenController} from "./ChargenController";
import {CreaturePanel} from "../ui/CreaturePanel";
import {Parse} from "../../engine/text/ParseTag";

export class ChargenStepFinalize extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Finalize";
	panel = new CreaturePanel();

	complete(): boolean {
		return false;
	}

	node(): VNode {
		let pc = this.player;
		let parser = new Parser(pc);
		this.panel.update(pc)
		return <Fragment>
			<h3>Review</h3>
			<div class="grid-12 gap-4 text-justify">
				<div class="cols-6">
					<p>
						You will play as <b>{pc.origin.shortDesc}, {pc.name} the {pc.txt.sex} {this.cc.race} {this.cc.classObject!.name.capitalize()}.</b>
					</p>
					<h5>Traits</h5>
					{pc.traits.size === 0 && "(No strating traits)"}
					{pc.traitList().map(t=><div>
						<b>{t.name(pc)}</b> &ndash; <Parse>{t.description(pc)}</Parse>
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
