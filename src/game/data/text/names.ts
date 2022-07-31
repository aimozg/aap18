/*
 * Created by aimozg on 13.07.2022.
 */

import {TGender} from "../../../engine/rules/gender";
import {Random} from "../../../engine/math/Random";
import fxrng from "../../../engine/math/fxrng";

export type TNameGenerator = 'rcv' | 'list';

export function randomName(gender: TGender, generator: TNameGenerator | 'random' = 'random', flavor: string = '', rng: Random = fxrng): string {
	if (generator === 'random') generator = rng.pick(['rcv', 'list']) as TNameGenerator
	switch (generator) {
		case 'list':
			return namegenList(gender, flavor, rng);
		case "rcv":
			return namegenRcv(gender == 'f' ? 0.75 : gender == 'm' ? 0.25 : 0.5, rng);
	}
}

// Name generator - random consonant-vowel sequence of length 3..9

const rfnVowels = [
	'a', 'e', 'i', 'o', 'u',
	'a', 'e', 'i', 'o', 'u',
	'ea', 'ae', 'ee', 'ie', 'ia',
	'y'
];
const rfnConstants = [
	'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'z',
	'b', 'd', 'f', 'l', 'n', 'r', 's', 't',
	'b', 'd', 'f', 'l', 'n', 'r', 's', 't',
	'gh', 'll', 'ph', 'kh', 'th', 'st'
];

function namegenRcv(femininity: number, rng: Random): string {
	let name = '';
	let c = rng.nextBoolean() ? 'c' : 'v';
	let n = rng.d3(3);
	while (n-- > 0) {
		if (c === 'c') {
			name += rng.pick(rfnConstants)
			c = 'v';
		} else {
			name += rng.pick(rfnVowels)
			c = 'c';
		}
	}
	return name.capitalize();
}

// Name generator - pick name from list
// Flavors - european, japanese, chinese
// Used name lists from DoL, XCOM and Wikipedia

interface NameList {
	both: string[],
	male: string[],
	female: string[]
}

const NameLists: Record<string, NameList> = {
	'european': {
		both: ['Alex', 'Charlie', 'Chris', 'Morgan', 'Quinn', 'Robin', 'Ross', 'Sam', 'Sydney'],
		male: ['Albert', 'Andy', 'Brian', 'Daniel', 'Eric', 'Gary', 'Jordan', 'Nick', 'Richard', 'Roland', 'Ruben', 'Tim', 'Tom'],
		female: ['Alice', 'Diana', 'Elizabeth', 'Emily', 'Eve', 'Helen', 'Jane', 'Jeanne', 'Kate', 'Lauren', 'Lena', 'Lisa', 'Mary', 'Melissa', 'Rachel', 'Tiffany', 'Tina']
	},
	'japanese': {
		both: ['Kagami', 'Homura', 'Makoto', 'Naoki', 'Rin', 'Yutaka'],
		male: ['Hideo', 'Kaito', 'Kenji', 'Ryo', 'Shigery', 'Shin', 'Shiro'],
		female: ['Aiko', 'Aoi', 'Hitomi', 'Kasumi', 'Midori', 'Misaki', 'Sakura', 'Sayaka', 'Yoko', 'Yui']
	},
	'chinese': {
		both: ['Chi', 'Fei', 'Feng', 'Jun', 'Long', 'Wei', 'Yang', 'Ye'],
		male: ['Chen', 'Cheng', 'Hao', 'Kong', 'Lian', 'Liang', 'Ming', 'On', 'Shen', 'Sheng', 'Tao', 'Ye'],
		female: ['An', 'Ying', 'Xue', 'Jia Li', 'Jiang Li', 'Li Mei', 'Li Ming', 'Li Wei']
	}
}

function namegenList(gender: TGender, flavor: string, rng: Random): string {
	if (!(flavor in NameLists)) flavor = rng.pick(Object.keys(NameLists));
	let group = NameLists[flavor];
	let nb = group.both.length;
	let nm = group.male.length;
	let nf = group.female.length;
	if (gender == 'm' && rng.nextBoolean(nm / (nm + nb))) {
		return rng.pick(group.male);
	} else if (gender == 'f' && rng.nextBoolean(nf / (nf + nb))) {
		return rng.pick(group.female);
	} else {
		return rng.pick(group.both);
	}
}
