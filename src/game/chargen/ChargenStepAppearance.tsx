import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";
import {Parser} from "../../engine/text/parser/Parser";
import {Appearance} from "../data/text/Appearance";
import {ListColorPicker} from "../../engine/ui/components/ListColorPicker";
import {HumanEyeColorNames, HumanHairColorNames, HumanSkinColorNames} from "../data/colors";
import {Color} from "../../engine/objects/Color";
import {ButtonMenu} from "../../engine/ui/components/ButtonMenu";
import {HairLengthTier} from "../data/body/Hair";
import fxrng from "../../engine/math/fxrng";
import {BreastSizeTier} from "../data/body/Breasts";

export class ChargenStepAppearance extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
		// TODO move elsewhere
		pcdata.player.body.hairColor1 = fxrng.pick(this.hairColors);
		pcdata.player.body.eyes.color = fxrng.pick(this.eyeColors);
		pcdata.player.body.skinColor1 = fxrng.pick(this.skinColors);
	}

	label: string = "Appearance";
	hairColors = this.game.data.colorsByNames(HumanHairColorNames, "hair")
	eyeColors = this.game.data.colorsByNames(HumanEyeColorNames, "eyes")
	skinColors = this.game.data.colorsByNames(HumanSkinColorNames, "skin")

	complete(): boolean {
		return this.player.body.hairColor1 !== Color.DEFAULT_WHITE && this.player.body.skinColor1 !== Color.DEFAULT_WHITE && this.player.body.eyes.color !== Color.DEFAULT_WHITE;
	}

	setHairColor(color: Color) {
		this.player.body.hairColor1 = color
		this.onUpdate()
	}

	setSkinColor(color: Color) {
		this.player.body.skinColor1 = color
		this.onUpdate()
	}

	setEyeColor(color: Color) {
		this.player.body.eyes.color = color
		this.onUpdate()
	}

	setHairLength(length: number) {
		this.player.body.hair.length = length
		this.onUpdate()
	}

	setBreastSize(size: number) {
		this.player.body.breasts.size = size;
		this.onUpdate()
	}

	node(): VNode {

		let parser = new Parser(this.player);
		let body = this.player.body;
		return <Fragment>
			<div class="grid-12 gap-2">
				<div class="col-span-6">
					{Appearance.characterAppearance(this.player, parser)}
				</div>
				<div class="col-span-6">
					{/*TODO configurables:
					 - hair style
					 - other body materials (if present)
					 - height
					 - dick size
					 - breast size
					 - thickness & tone
					*/}
					<p>
						<label>Hair length</label>
						<div>
							<ButtonMenu items={HairLengthTier.list().map(hlt => ({label:hlt.name, value:hlt.value}))} onChange={length => this.setHairLength(length)} selected={body.hair.length}/>
						</div>
						<label>Hair color</label>
						<ListColorPicker colors={this.hairColors}
						                 startValue={body.hairColor1}
						                 onChange={color => this.setHairColor(color)}/>
					</p>
					<p>
						<label>Eye color</label>
						<ListColorPicker colors={this.eyeColors}
						                 startValue={body.eyes.color}
						                 onChange={color => this.setEyeColor(color)}/>
					</p>
					<p>
						<label>Skin color</label>
						<ListColorPicker colors={this.skinColors}
						                 startValue={body.skinColor1}
						                 onChange={color => this.setSkinColor(color)}/>
					</p>
					<p>
						<label>Breast size</label>{/*TODO limit allowed ranges*/}
						<div>
							<ButtonMenu items={BreastSizeTier.list().map(bst => ({label:bst.name, value:bst.value}))} onChange={size => this.setBreastSize(size)} selected={body.breasts.size}/>
						</div>
					</p>
				</div>
			</div>
		</Fragment>;
	}

}
