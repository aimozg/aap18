import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";
import {ButtonMenu, ButtonMenuItem} from "../../engine/ui/components/ButtonMenu";
import {simpleparse} from "../../engine/text/utils";

export class ChargenStepClass extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
	}

	label: string = "Class";

	complete(): boolean {
		return !!this.pcdata.cclass && this.game.data.class(this.pcdata.cclass).isStartingClass;
	}

	private items: ButtonMenuItem<string>[] = this.game.data.classes.values().map(cls=>({
		label: cls.name.capitalize(),
		value: cls.resId,
		className: cls.isStartingClass ? '' : '-shadowed'
	}))

	node(): VNode {
		return <Fragment>
			<p>
				Picking a class unlocks perks, skills, and abilities.
				Every 6th level you can advance your class or pick another.
			</p>
			<div class="d-grid" style="grid-template-columns: max-content 1fr; min-height:6rem">
				<div class="d-flex gap-2 flex-column ai-stretch mr-4">
					<ButtonMenu items={this.items}
					            selected={this.pcdata.cclass}
					            onChange={(x)=>{
									this.pcdata.cclass=x;
									this.onUpdate();
					            }}/>
				</div>
				<div>
					{simpleparse(this.game.data.classes.getOrNull(this.pcdata.cclass)?.description)}
				</div>
			</div>
		</Fragment>;
	}

}
