import {Fragment, h, VNode} from "preact";
import {ButtonMenu} from "../../engine/ui/components/ButtonMenu";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";
import {simpleparse} from "../../engine/text/utils";

export class ChargenStepOrigin extends ChargenStep {
	label = "Origin";

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
	}

	private items = this.game.idata.playerOrigins.map(o => ({
		label: o.name,
		value: o.id
	}));

	complete(): boolean {
		return !!this.player.originId;
	}

	node(): VNode {
		return <Fragment>
			<p>
				Where do you come from?
			</p>
			<p>
				<ButtonMenu items={this.items}
				            selected={this.player.originId}
				            onChange={(o) => {
					            this.player.originId = o;
					            this.onUpdate();
				            }}/>
			</p>
			<p>
				{simpleparse(this.game.idata.playerOrigins.find(o => o.id === this.player.originId)?.description)}
			</p>
		</Fragment>;
	}
}
