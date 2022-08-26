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
				Picking a class unlocks traits, skills, and abilities.
				Every 6th level you can advance your class or pick another.
			</p>
			<div class="grid-12">
				<div class="cols-3 d-flex gap-2 flex-column ai-stretch mr-4">
					<ButtonMenu items={this.items}
					            className="-big"
					            selected={this.cc.cclass}
					            onChange={x=>this.cc.setClass(x)}/>
				</div>
				<div class="cols-9">
					{simpleparse(this.cc.classObject?.description)}
				</div>
			</div>
		</Fragment>;
	}

}
