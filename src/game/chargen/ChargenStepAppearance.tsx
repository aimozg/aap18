import {Fragment, h, VNode} from "preact";
import {ChargenStep} from "./ChargenStep";
import {Parser} from "../../engine/text/parser/Parser";
import {Appearance} from "../data/text/Appearance";
import {ListColorPicker} from "../../engine/ui/components/ListColorPicker";
import {Color} from "../../engine/objects/Color";
import {ButtonMenu} from "../../engine/ui/components/ButtonMenu";
import {HairLengthTier} from "../data/body/Hair";
import {ChargenController} from "./ChargenController";

export class ChargenStepAppearance extends ChargenStep {

	constructor(cc: ChargenController) {
		super(cc);
	}

	label: string = "Appearance";

	complete(): boolean {
		return true;
	}

	setHairColor(color: Color) {
		this.cc.body.hairColor1 = color
		this.cc.update()
	}

	setSkinColor(color: Color) {
		this.cc.body.skinColor1 = color
		this.cc.update()
	}

	setEyeColor(color: Color) {
		this.cc.body.eyes.color = color
		this.cc.update()
	}

	setHairLength(length: number) {
		this.cc.body.hair.length = length
		this.cc.update()
	}

	setBreastSize(size: number) {
		this.cc.body.breasts.size = size;
		this.cc.update()
	}

	setPenisSize(size: number) {
		this.cc.body.penis.size = size;
		this.cc.update()
	}

	setHeight(value:number) {
		if (!isFinite(value)) return;
		this.cc.body.height = value;
		this.cc.update()
	}

	node(): VNode {

		let parser = new Parser(this.player);
		let body = this.player.body;
		return <Fragment>
			<h3>Appearance</h3>
			<div class="grid-12 gap-2">
				<div class="cols-7 vscroll">
					{/*TODO configurables:
					 - hair style
					 - other body materials (if present)
					 - height
					 - dick size
					 - breast size
					 - thickness & tone
					*/}
					<p>
						<label>Height</label>
						<input type="number"
						       step="5"
						       value={body.height}
						       min="120"
						       max="210"
						       class="ml-1"
						       onInput={event => this.setHeight(+(event.target as HTMLInputElement).value)}/>cm
					</p>
					<p>
						<label>Hair length</label>
						<div class="d-flex flex-wrap gap-1">
							<ButtonMenu items={HairLengthTier.list().map(hlt => ({label:hlt.reach, value:hlt.value}))} onChange={length => this.setHairLength(length)} selected={body.hair.length}/>
						</div>
						<label>Hair color</label>
						<ListColorPicker colors={this.cc.allowedHairColors()}
						                 startValue={body.hairColor1}
						                 onChange={color => this.setHairColor(color)}/>
					</p>
					<p>
						<label>Eye color</label>
						<ListColorPicker colors={this.cc.allowedEyeColors()}
						                 startValue={body.eyes.color}
						                 onChange={color => this.setEyeColor(color)}/>
					</p>
					<p>
						<label>Skin color</label>
						<ListColorPicker colors={this.cc.allowedSkinColors()}
						                 startValue={body.skinColor1}
						                 onChange={color => this.setSkinColor(color)}/>
					</p>
					<p>
						<label>Breast size</label>
						<div class="d-flex flex-wrap gap-1">
							<ButtonMenu items={this.cc.allowedBreastSizes()} onChange={size => this.setBreastSize(size)} selected={body.breasts.size}/>
						</div>
					</p>
					<p>
						<label>Penis size</label>{/*TODO or number slider?*/}
						<div class="d-flex flex-wrap gap-1">
							<ButtonMenu items={this.cc.allowedPenisSizes()} onChange={size => this.setPenisSize(size)} selected={body.penis.size}/>
						</div>
					</p>
				</div>
				<div className="cols-5">
					{Appearance.characterAppearance(this.player, parser)}
				</div>
			</div>
		</Fragment>;
	}

}
