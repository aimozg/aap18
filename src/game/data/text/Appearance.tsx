/*
 * Created by aimozg on 04.08.2022.
 */

import {Character} from "../../../engine/objects/creature/Character";
import {Parser} from "../../../engine/text/parser/Parser";
import {Fragment} from "preact/compat";
import {h} from "preact";

export namespace Appearance {
	export function characterAppearance(pc: Character, parser: Parser) {
		parser.select(pc)
		return <Fragment>
			<p>
				You are {pc.txt.sex} {pc.rgroup.name.toLowerCase()}. {/*TODO race*/}
			</p>
			<p>{/*Head*/}
				{parser.print(pc.body.ears.fullDescription())}{" "}
				{parser.print(pc.body.eyes.fullDescription())}{" "}
				{parser.print(pc.body.hair.fullDescription())}{" "}
			</p>
			<p>{/*Extremities*/}
				{parser.print(pc.body.arms.fullDescription())}{" "}
				{parser.print(pc.body.legs.fullDescription())}{" "}
				{parser.print(pc.body.wings.fullDescription())}{" "}
				{parser.print(pc.body.tail.fullDescription())}{" "}
			</p>
			<p>
				{pc.body.materials.map(m => m.isPresent &&
					<Fragment>{parser.print(m.fullDescription())}{" "}</Fragment>)}
			</p>
		</Fragment>
	}
}
