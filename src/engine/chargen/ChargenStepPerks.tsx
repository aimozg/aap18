import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {ChargenController} from "./ChargenController";
import {ButtonMenu} from "../ui/components/ButtonMenu";
import {Parse} from "../text/ParseTag";

export class ChargenStepPerks extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Perks";

	complete(): boolean {
		return true;
	}

	node(): VNode {
		return <Fragment>
			<h3>Perks</h3>
			<p>Pick your strating perk.</p>
			<div class="grid-12 gap-4">
				<div class="cols-6 d-flex flex-column ai-stretch">
					<ButtonMenu items={this.cc.allowedPerks()}
					            onChange={x=>this.cc.setPerk(x)}
					            selected={this.cc.perk}/>
				</div>
				<div class="cols-6">
					<Parse>{this.cc.perkObject?.description(this.player)}</Parse>
				</div>
			</div>

		</Fragment>;
	}

}
