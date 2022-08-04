import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";
import {Parser} from "../../engine/text/parser/Parser";
import {Appearance} from "../data/text/Appearance";

export class ChargenStepFinalize extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
	}

	label: string = "Finalize";

	complete(): boolean {
		return false;
	}

	node(): VNode {
		let pc = this.player;
		let parser = new Parser(pc);
		return <Fragment>
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
