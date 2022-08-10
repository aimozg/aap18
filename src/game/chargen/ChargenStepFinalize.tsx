import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {Parser} from "../../engine/text/parser/Parser";
import {Appearance} from "../data/text/Appearance";
import {ChargenController} from "./ChargenController";

export class ChargenStepFinalize extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Finalize";

	complete(): boolean {
		return false;
	}

	node(): VNode {
		let pc = this.player;
		let parser = new Parser(pc);
		return <Fragment>
			<h3>Review</h3>
			<p>
				You will play as warrior {pc.name}. {/*TODO classes*/}
			</p>
			{Appearance.characterAppearance(pc, parser)}
			<p>
				TODO display character sheet for review
			</p>
		</Fragment>;
	}

}
