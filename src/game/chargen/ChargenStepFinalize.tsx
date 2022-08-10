import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {Parser} from "../../engine/text/parser/Parser";
import {Appearance} from "../data/text/Appearance";
import {ChargenController} from "./ChargenController";
import {CreaturePanel} from "../ui/CreaturePanel";

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
				<div class="col-span-6">
					<p>
						You will play as <b>{pc.name} the {this.cc.race} {this.cc.classObject.name.capitalize()}.</b>
					</p>
					{Appearance.characterAppearance(pc, parser)}
				</div>
				<div class="col-span-6">
					{this.panel.astsx}
				</div>
			</div>
		</Fragment>;
	}

}
