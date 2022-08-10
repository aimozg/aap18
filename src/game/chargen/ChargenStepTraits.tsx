import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {ChargenController} from "./ChargenController";

export class ChargenStepTraits extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Traits";

	complete(): boolean {
		return true;
	}

	node(): VNode {
		return <Fragment>
			<h3>Traits</h3>
			TODO choose starting traits.
		</Fragment>;
	}

}
