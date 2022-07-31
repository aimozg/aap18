import {ButtonMenu, ButtonMenuItem} from "../../engine/ui/components/ButtonMenu";
import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";

export class ChargenStepRace extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void, private races: ButtonMenuItem<string>[]) {
		super(pcdata, onUpdate);
	}

	label: string = "Race";

	complete(): boolean {
		return !!this.pcdata.race;
	}

	node(): VNode {
		return <Fragment>
			<p>What is your starting race?</p>
			<p><ButtonMenu items={this.races} selected={this.pcdata.race} onChange={race => {
				this.pcdata.race = race;
				this.onUpdate();
			}}/></p>
		</Fragment>
	}
}
