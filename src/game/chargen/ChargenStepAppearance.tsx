import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";
import {Parser} from "../../engine/text/parser/Parser";
import {Appearance} from "../data/text/Appearance";
import {ListColorPicker} from "../../engine/ui/components/ListColorPicker";
import {HumanEyeColorNames, HumanHairColorNames, HumanSkinColorNames} from "../data/colors";
import {Color, colorSortKey} from "../../engine/objects/Color";
import {ButtonMenu} from "../../engine/ui/components/ButtonMenu";
import {HairLengthTier} from "../data/body/Hair";
import fxrng from "../../engine/math/fxrng";

export class ChargenStepAppearance extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
		// TODO move elsewhere
		pcdata.player.body.hairColor1 = fxrng.pick(this.hairColors);
		pcdata.player.body.eyes.color = fxrng.pick(this.eyeColors);
		pcdata.player.body.skinColor1 = fxrng.pick(this.skinColors);
	}

	label: string = "Appearance";
	hairColors = HumanHairColorNames.map(cname => this.game.data.colorByName(cname, "hair")).sortWith(colorSortKey)
	eyeColors = HumanEyeColorNames.map(cname => this.game.data.colorByName(cname, "eyes")).sortWith(colorSortKey)
	skinColors = HumanSkinColorNames.map(cname => this.game.data.colorByName(cname, "skin")).sortWith(colorSortKey)

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

	node(): VNode {

		let parser = new Parser(this.player);
		return <Fragment>
			<div class="grid-12 gap-2">
				<div class="col-span-4">
					{Appearance.characterAppearance(this.player, parser)}
				</div>
				<div class="col-span-8">
					{/*TODO configurables:
					 - hair length,  style
					 - other body materials (if present)
					 - height
					 - dick size
					 - breast size
					 - thickness & tone
					*/}
					<p>
						<label>Hair length</label>
						<div>
							<ButtonMenu items={HairLengthTier.list().map(hlt => ({label:hlt.name, value:hlt.value}))} onChange={length => this.setHairLength(length)} selected={this.player.body.hair.length}/>
						</div>
						<label>Hair color</label>
						<ListColorPicker colors={this.hairColors}
						                 startValue={this.player.body.hairColor1}
						                 onChange={color => this.setHairColor(color)}/>
					</p>
					<label>Eye color</label>
					<ListColorPicker colors={this.eyeColors}
					                 startValue={this.player.body.eyes.color}
					                 onChange={color => this.setEyeColor(color)}/>
					<label>Skin color</label>
					<ListColorPicker colors={this.skinColors}
					                 startValue={this.player.body.skinColor1}
					                 onChange={color => this.setSkinColor(color)}/>
				</div>
			</div>
		</Fragment>;
	}

}
