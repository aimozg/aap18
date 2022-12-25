/*
 * Created by aimozg on 05.07.2022.
 */
import {ComponentChildren, Fragment, h, VNode} from "preact";
import {Parser} from "./parser/Parser";
import {TextOutput} from "./output/TextOutput";
import {substitutePattern} from "../utils/string";
import {DamageType} from "../rules/Damage";
import {Dice} from "../math/Dice";

export function simpleparse(input: string | null | undefined): VNode {
	if (!input) return <Fragment/>
	return TextOutput.render(new Parser().parse(input));
}

/**
 * Very primitive! Adds "s" or replaces "y" with "ies", for other nouns specify plural manually. Lowercase only
 */
export function guessPlural(singular:string):string {
	if (singular.endsWith('y')) return singular.substring(0, singular.length-1) + 'ies';
	return singular+'s';
}
// TODO allow numerals ("one thing") and
export function numberOfThings(count:number,
                               singular:string,
                               plural:string=guessPlural(singular),
                               pattern:string='{number} {noun}') {
	return substitutePattern(pattern, {
		'number': count,
		'noun': (count === 1 || count === -1) ? singular : plural
	})
}

export function damageSpan(damage: number | Dice | string, damageType: DamageType, hint:string|undefined=undefined):ComponentChildren {
	if (damage instanceof Dice) damage = damage.toString();
	return <span class={"text-damage-" + damageType.cssSuffix}
	             title={hint}>{damage} {damageType.name}</span>
}
