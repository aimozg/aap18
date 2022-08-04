import {Fragment, h, VNode} from "preact";
import {CGPCData} from "./chargenData";
import {ChargenStep} from "./ChargenStep";
import {Parser} from "../../engine/text/parser/Parser";
import {Appearance} from "../data/text/Appearance";
import {ListColorPicker} from "../../engine/ui/components/ListColorPicker";
import {HumanEyeColorNames, HumanHairColorNames, HumanSkinColorNames} from "../data/colors";
import {Color, colorSortKey} from "../../engine/objects/Color";

export class ChargenStepAppearance extends ChargenStep {

	constructor(pcdata: CGPCData, onUpdate: () => void) {
		super(pcdata, onUpdate);
	}

	label: string = "Appearance";
	hairColors = HumanHairColorNames.map(cname=>this.game.data.colorByName(cname,"hair")).sortWith(colorSortKey)
	eyeColors = HumanEyeColorNames.map(cname=>this.game.data.colorByName(cname,"eyes")).sortWith(colorSortKey)
	skinColors = HumanSkinColorNames.map(cname=>this.game.data.colorByName(cname,"skin")).sortWith(colorSortKey)

	complete(): boolean {
		return this.player.body.hairColor1 !== Color.DEFAULT_WHITE && this.player.body.skinColor1 !== Color.DEFAULT_WHITE && this.player.body.eyes.color !== Color.DEFAULT_WHITE;
	}

	setHairColor(color:Color) {
		this.player.body.hairColor1 = color
		this.onUpdate()
	}

	setSkinColor(color:Color) {
		this.player.body.skinColor1 = color
		this.onUpdate()
	}

	setEyeColor(color:Color) {
		this.player.body.eyes.color = color
		this.onUpdate()
	}

	node(): VNode {
		function fColor(color:Color):Color|null {
			return (color === Color.DEFAULT_WHITE) ? null : color;
		}
		let parser = new Parser(this.player);
		return <Fragment>
			<div>
				<div>
					{Appearance.characterAppearance(this.player, parser)}
				</div>
				<div>
					{/*TODO configurables:
					 - hair length,  style
					 - other body materials (if present)
					 - height
					 - dick size
					 - breast size
					 - thickness & tone
					*/}
					<label>Hair color</label>
					<ListColorPicker colors={this.hairColors}
					                 startValue={fColor(this.player.body.hairColor1)}
					                 onChange={color=>this.setHairColor(color)}/>
					<label>Eye color</label>
					<ListColorPicker colors={this.eyeColors}
					                 startValue={fColor(this.player.body.eyes.color)}
					                 onChange={color=>this.setEyeColor(color)}/>
					<label>Skin color</label>
					<ListColorPicker colors={this.skinColors}
					                 startValue={fColor(this.player.body.skinColor1)}
					                 onChange={color=>this.setSkinColor(color)}/>
				</div>
			</div>
		</Fragment>;
	}

}
