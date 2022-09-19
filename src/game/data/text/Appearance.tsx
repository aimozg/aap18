/*
 * Created by aimozg on 04.08.2022.
 */

import {Character} from "../../../engine/objects/creature/Character";
import {Parser} from "../../../engine/text/parser/Parser";
import {Fragment} from "preact/compat";
import {ComponentChild, h} from "preact";
import {ColorCircle} from "../../../engine/ui/components/ColorCircle";

// TODO Diversify descriptions - "You have DESC TYPE" | "Your TYPE is DESC" | "CUSTOMDESC"
export namespace Appearance {
	export function characterAppearance(pc: Character, parser: Parser): ComponentChild {
		parser.select(pc)
		return <Fragment>
			<p>{/*Intro*/}{/*TODO feet/inches*/}
				You are {pc.body.height.toFixed()}cm tall {pc.txt.sex} {pc.rgroup.name.toLowerCase()}. {/*TODO race*/}
			</p>
			<p>{/*Head*/}
				{parser.print(pc.body.face.fullDescription())}{" "}
				{parser.print(pc.body.hair.fullDescription())}{" "}
				{parser.print(pc.body.ears.fullDescription())}{" "}
				{parser.print(pc.body.eyes.fullDescription())}{" "}
				{pc.body.horns.isPresent && parser.print(pc.body.horns.fullDescription())}{" "}
			</p>
			<p>{/*Torso*/}
				{parser.print(pc.body.skin.fullDescription())}{" "}
				{pc.body.coat.isPresent && parser.print(pc.body.coat.fullDescription())}{" "}
			</p>
			<p>{/*Extremities*/}
				{parser.print(pc.body.arms.fullDescription())}{" "}
				{parser.print(pc.body.legs.fullDescription())}{" "}
				{pc.body.wings.isPresent && parser.print(pc.body.wings.fullDescription())}{" "}
				{pc.body.tail.isPresent && parser.print(pc.body.tail.fullDescription())}{" "}
			</p>
			<p>{/*Chest and genitalia*/}
				{parser.print(pc.body.breasts.fullDescription())}{" "}
				{pc.body.penis.isPresent && parser.print(pc.body.penis.fullDescription())}{" "}
				{pc.body.vagina.isPresent && parser.print(pc.body.vagina.fullDescription())}{" "}
			</p>
			{Appearance.characterColors(pc, parser)}
		</Fragment>
	}
	export function characterColors(pc:Character, parser:Parser): ComponentChild {
		parser.select(pc)
		return <p>
			{pc.body.materials.map(m => m.isPresent &&
				<Fragment>
					<ColorCircle color={m.color1.rgb} color2={m.binaryColor?m.color2.rgb:undefined} className="-small mr-2"/>
					{parser.print(m.fullDescription())}<br/></Fragment>)}

			<ColorCircle color={pc.body.eyes.color.rgb} className="-small mr-2"/>
			{parser.print("[You] [have] "+pc.body.eyes.color.name+" eyes. ")}<br/>
		</p>
	}
}
