import {ButtonMenu, ButtonMenuItem} from "../../engine/ui/components/ButtonMenu";
import {TSex} from "../../engine/rules/gender";
import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";
import {TextInput} from "../../engine/ui/components/TextInput";
import {Button} from "../../engine/ui/components/Button";
import {randomName} from "../data/text/names";
import {BreastSizeTiers} from "../data/body/Breasts";
import fxrng from "../../engine/math/fxrng";

export class ChargenStepSex extends ChargenStep {


	constructor(pcdata: CGPCData,
	            onUpdate: () => void,
	            private allowHerm: boolean) {
		super(pcdata, onUpdate);
	}

	private items: ButtonMenuItem<TSex>[] = [{
		label: "Male",
		value: 'm'
	}, {
		label: "Female",
		value: 'f'
	}, {
		label: "Futanari",
		value: 'h',
		disabled: !this.allowHerm
	}];

	setSex(sex:TSex) {
		this.player.sex = sex;
		this.player.gender =
			sex === 'm' ? 'm' :
				sex === 'f' || sex === 'h' ? 'f' : 'x';
		this.player.body.breasts.size = sex === 'm' ? BreastSizeTiers.FLAT.value : fxrng.nextInt(BreastSizeTiers.A_CUP.value, BreastSizeTiers.DD_CUP.value);
		this.onUpdate()
	}
	setName(name:string) {
		this.player.name = name;
		this.onUpdate();
	}

	randomName() {
		this.player.name = randomName(this.player.gender);
		this.onUpdate();
	}

	complete(): boolean {
		return this.player.sex != 'n' && !!this.player.name;
	}

	label = "Name";

	node(): VNode {
		return <Fragment>
			<p>What's your name?</p>
			<p>
				<TextInput value={this.player.name} onChange={name=>this.setName(name)}/>
				<Button label="Random" onClick={()=>this.randomName()}/>
			</p>
			<p>What is your starting sex?</p>
			<p>
				<ButtonMenu items={this.items} selected={this.player.sex} onChange={sex => this.setSex(sex)}/>
			</p>
		</Fragment>
	}

}
