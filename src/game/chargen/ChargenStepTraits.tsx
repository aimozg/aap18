import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";

export class ChargenStepTraits extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
	}

	label: string = "Traits";

	complete(): boolean {
		return true;
	}

	node(): VNode {
		return <Fragment>
			TODO choose starting traits.
			<ul>
				<li></li>
			</ul>
		</Fragment>;
	}

}
