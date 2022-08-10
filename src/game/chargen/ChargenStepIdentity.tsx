import {ButtonMenu, ButtonMenuItem} from "../../engine/ui/components/ButtonMenu";
import {TSex} from "../../engine/rules/gender";
import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {TextInput} from "../../engine/ui/components/TextInput";
import {Button} from "../../engine/ui/components/Button";
import {ChargenController} from "./ChargenController";

export class ChargenStepIdentity extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	complete(): boolean {
		return this.player.sex != 'n' && !!this.player.name;
	}

	label = "Identity";

	node(): VNode {
		let items: ButtonMenuItem<TSex>[] = [{
			label: "Male",
			value: 'm'
		}, {
			label: "Female",
			value: 'f'
		}, {
			label: "Futanari",
			value: 'h',
			disabled: !this.cc.futanariAllowed()
		}];
		return <Fragment>
			<h3>Identity</h3>
			<p>What's your name?</p>
			<p>
				<TextInput value={this.player.name} onChange={name=>this.cc.setName(name)}/>
				<Button label="Random" onClick={()=>this.cc.setRandomName()}/>
			</p>
			<p>What is your starting sex?</p>
			<p>
				<ButtonMenu items={items} selected={this.player.sex} onChange={sex => this.cc.setSex(sex)}/>
			</p>
		</Fragment>
	}

}
