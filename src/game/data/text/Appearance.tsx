/*
 * Created by aimozg on 04.08.2022.
 */

import {Character} from "../../../engine/objects/creature/Character";
import {Parser} from "../../../engine/text/parser/Parser";
import {Fragment} from "preact/compat";
import {ComponentChild, h} from "preact";
import {ColorCircle} from "../../../engine/ui/components/ColorCircle";
import {Parse} from "../../../engine/text/ParseTag";

// TODO Diversify descriptions - "You have DESC TYPE" | "Your TYPE is DESC" | "CUSTOMDESC"
export namespace Appearance {
	export function characterAppearance(pc: Character, parser: Parser = new Parser()): ComponentChild {
		parser.setTarget(pc)
		return <Parse parser={parser}>
			<p>{/*Intro*/}{/*TODO feet/inches*/}
				You are {pc.body.height.toFixed()}cm tall {pc.txt.sex} {pc.rgroup.name.toLowerCase()}. {/*TODO race*/}
			</p>
			<p>{/*Head*/}
				{pc.body.face.fullDescription()}{" "}
				{pc.body.hair.fullDescription()}{" "}
				{pc.body.ears.fullDescription()}{" "}
				{pc.body.eyes.fullDescription()}{" "}
				{pc.body.horns.isPresent && pc.body.horns.fullDescription()}{" "}
			</p>
			<p>{/*Torso*/}
				{pc.body.skin.fullDescription()}{" "}
				{pc.body.coat.isPresent && pc.body.coat.fullDescription()}{" "}
			</p>
			<p>{/*Extremities*/}
				{pc.body.arms.fullDescription()}{" "}
				{pc.body.legs.fullDescription()}{" "}
				{pc.body.wings.isPresent && pc.body.wings.fullDescription()}{" "}
				{pc.body.tail.isPresent && pc.body.tail.fullDescription()}{" "}
			</p>
			<p>{/*Chest and genitalia*/}
				{pc.body.breasts.fullDescription()}{" "}
				{pc.body.penis.isPresent && pc.body.penis.fullDescription()}{" "}
				{pc.body.vagina.isPresent && pc.body.vagina.fullDescription()}{" "}
			</p>
			{Appearance.characterColors(pc, parser)}
		</Parse>
	}

	export function characterColors(pc: Character, parser: Parser): ComponentChild {
		parser.setTarget(pc)
		return <p>
			<Parse parser={parser}>
				{pc.body.materials.map(m => m.isPresent &&
					<Fragment>
						<ColorCircle color={m.color1.rgb} color2={m.binaryColor ? m.color2.rgb : undefined}
						             className="-small mr-2"/>
						{m.fullDescription()}<br/></Fragment>)}

				<ColorCircle color={pc.body.eyes.color.rgb} className="-small mr-2"/>
				[You] [have] {pc.body.eyes.color.name} eyes.<br/>
			</Parse>
		</p>
	}
}
