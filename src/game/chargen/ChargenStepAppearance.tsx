import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";

export class ChargenStepAppearance extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
	}

	label: string = "Appearance";

	complete(): boolean {
		return !!this.player.hairColor && !!this.player.eyeColor;
	}

	node(): VNode {
		return <Fragment>
			<div>
				<div>
					{/*TODO preview would go here */}
				</div>
				<div>
					{/*TODO configurables:
					 - hair length, color, style
					 - eye color
					 - skin color
					 - other body materials
					 - height
					 - dick size
					 - breast size
					 - thickness & tone
					*/}
				</div>
			</div>
		</Fragment>;
	}

}
