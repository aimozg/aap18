import {ButtonMenu} from "../ui/components/ButtonMenu";
import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {ChargenController} from "./ChargenController";

export class ChargenStepRace extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Race";

	complete(): boolean {
		return !!this.cc.race;
	}

	node(): VNode {
		return <Fragment>
			<h3>Race</h3>
			<p>What is your starting race?</p>
			<div class="grid-12">
				<div class="cols-3 d-flex flex-column ai-stretch mr-4">
					<ButtonMenu items={this.cc.allowedRaces()} selected={this.cc.race} onChange={race => {
						this.cc.setRace(race);
					}}/>
				</div>
				<div class="cols-9"></div>
			</div>
		</Fragment>
	}
}
