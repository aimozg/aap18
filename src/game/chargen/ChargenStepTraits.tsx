import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {ChargenController} from "./ChargenController";
import {ButtonMenu} from "../../engine/ui/components/ButtonMenu";
import {simpleparse} from "../../engine/text/utils";

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
					{simpleparse(this.cc.traitObject?.description(this.player))}
				</div>
			</div>

		</Fragment>;
	}

}
