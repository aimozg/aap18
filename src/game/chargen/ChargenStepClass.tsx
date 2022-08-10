import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {ButtonMenu, ButtonMenuItem} from "../../engine/ui/components/ButtonMenu";
import {simpleparse} from "../../engine/text/utils";
import {ChargenController} from "./ChargenController";

export class ChargenStepClass extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Class";

	complete(): boolean {
		return !!this.cc.cclass && this.game.data.class(this.cc.cclass).isStartingClass;
	}

	private items: ButtonMenuItem<string>[] = this.game.data.classes.values().map(cls=>({
		label: cls.name.capitalize(),
		value: cls.resId,
		className: cls.isStartingClass ? '' : '-shadowed'
	}))

	node(): VNode {
		return <Fragment>
			<h3>Class</h3>
			<p>
				Picking a class unlocks perks, skills, and abilities.
				Every 6th level you can advance your class or pick another.
			</p>
			<div class="d-grid" style="grid-template-columns: max-content 1fr; min-height:6rem">
				<div class="d-flex gap-2 flex-column ai-stretch mr-4">
					<ButtonMenu items={this.items}
					            selected={this.cc.cclass}
					            onChange={(x)=>{
									this.cc.setClass(x);
					            }}/>
				</div>
				<div>
					{simpleparse(this.game.data.classes.getOrNull(this.cc.cclass)?.description)}
				</div>
			</div>
		</Fragment>;
	}

}
