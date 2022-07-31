/*
 * Created by aimozg on 05.07.2022.
 */
import {Fragment, h, VNode} from "preact";
import {Parser} from "./parser/Parser";
import {TextOutput} from "./output/TextOutput";

export function simpleparse(input:string):VNode {
	if (!input) return <Fragment/>
	return TextOutput.print(new Parser().parse(input));
}

