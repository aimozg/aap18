/*
 * Created by aimozg on 05.07.2022.
 */
import {Fragment, h, VNode} from "preact";
import {Parser} from "./parser/Parser";
import {TextOutput} from "./output/TextOutput";
import {substitutePattern} from "../utils/string";

export function simpleparse(input: string | null | undefined): VNode {
	if (!input) return <Fragment/>
	return TextOutput.render(new Parser().parse(input));
}

// TODO allow numerals ("one thing") and
export function numberOfThings(count:number, singular:string, plural:string, pattern:string='{number} {noun}') {
	return substitutePattern(pattern, {
		'number': count,
		'noun': (count === 1 || count === -1) ? singular : plural
	})
}
