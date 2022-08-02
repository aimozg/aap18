import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";
import {SexNames} from "../data/text/gender";
import {Parser} from "../../engine/text/parser/Parser";

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
		let parser = new Parser();
		return <Fragment>
			<p>
				You will play as {pc.name}, {SexNames[pc.sex]} {pc.rgroup.name.toLowerCase()} warrior.
			</p>
			<p>
				{parser.print(pc.body.ears.fullDescription())}{" "}
				{parser.print(pc.body.eyes.fullDescription())}{" "}
				{parser.print(pc.body.arms.fullDescription())}{" "}
				{parser.print(pc.body.tail.fullDescription())}{" "}
			</p>
			<p>
				{pc.body.materials.map(m=>m.isPresent && <Fragment>{parser.print(m.fullDescription())}{" "}</Fragment>)}
			</p>
			<p>
				TODO display character sheet for review
			</p>
		</Fragment>;
	}

}
