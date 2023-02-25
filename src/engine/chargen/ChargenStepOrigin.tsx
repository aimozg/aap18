import {Fragment, h, VNode} from "preact";
import {ButtonMenu} from "../ui/components/ButtonMenu";
import {ChargenStep} from "./ChargenStep";
import {ChargenController} from "./ChargenController";
import {Parse} from "../text/ParseTag";

export class ChargenStepOrigin extends ChargenStep {
	label = "Origin";

	constructor(cc: ChargenController) {
		super(cc);
	}

	private items = this.game.idata.playerOrigins.map(o => ({
		label: o.name,
		value: o.id
	}));

	complete(): boolean {
		return !!this.cc.origin;
	}

	node(): VNode {
		return <Fragment>
			<h3>Origins</h3>
			<p>
				Where do you come from?
			</p>
			<div class="grid-12">
				<div class="cols-6 cols-lg-3 d-flex flex-column ai-stretch mr-4">
					<ButtonMenu items={this.items}
					            className="-big"
					            selected={this.cc.origin}
					            onChange={(o) => {
									this.cc.setOrigin(o);
					            }}/>
				</div>
				<div class="cols-6 cols-lg-9">
					<Parse>
					{this.game.idata.playerOrigins.find(o => o.id === this.cc.origin)?.description}
					</Parse>
				</div>
			</div>
		</Fragment>;
	}
}
