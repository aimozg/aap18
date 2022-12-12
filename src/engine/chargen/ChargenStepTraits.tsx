import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {ChargenController} from "./ChargenController";
import {ButtonMenu} from "../ui/components/ButtonMenu";
import {Parse} from "../text/ParseTag";

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
			<p>Pick your strating trait.</p>
			<div class="grid-12">
				<div class="cols-3 d-flex flex-column ai-stretch mr-4">
					<ButtonMenu items={this.cc.allowedTraits()}
					            onChange={x=>this.cc.setTrait(x)}
					            selected={this.cc.trait}/>
				</div>
				<div class="cols-9">
					<Parse>{this.cc.traitObject?.description(this.player)}</Parse>
				</div>
			</div>

		</Fragment>;
	}

}