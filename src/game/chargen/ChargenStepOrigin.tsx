import {Fragment, h, VNode} from "preact";
import {ButtonMenu} from "../../engine/ui/components/ButtonMenu";
import {ChargenStep} from "./ChargenStep";
import {simpleparse} from "../../engine/text/utils";
import {ChargenController} from "./ChargenController";

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
			<p>
				<ButtonMenu items={this.items}
				            selected={this.cc.origin}
				            onChange={(o) => {
								this.cc.setOrigin(o);
				            }}/>
			</p>
			<p>
				{simpleparse(this.game.idata.playerOrigins.find(o => o.id === this.cc.origin)?.description)}
			</p>
		</Fragment>;
	}
}
