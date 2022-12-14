/*
 * Created by aimozg on 13.07.2022.
 */

import {TGender} from "../../../engine/rules/gender";
import {Random} from "../../../engine/math/Random";
import fxrng from "../../../engine/math/fxrng";

export type TNameGenerator = 'markov' | 'list';

export function randomName(gender: TGender, generator: TNameGenerator = 'markov', flavor: string = '', rng: Random = fxrng): string {
	// if (generator === 'random') generator = rng.pick(['markov', 'list']) as TNameGenerator
	switch (generator) {
		case 'list':
			return namegenList(gender, flavor, rng);
		case "markov":
			return namegenMarkov(gender, flavor, rng);
		// case "rcv":
		// 	return namegenRcv(gender == 'f' ? 0.75 : gender == 'm' ? 0.25 : 0.5, rng);
	}
}

// Name generator - Markov chain-based

interface MarkovNamegenData {
	/** `prev -> { next -> count }` */
	pairs: Record<string,Record<string,number>>;
	/** `prev -> count` */
	counts: Record<string,number>;
	/** `prev -> { follows -> count }` */
	balances: Record<string,Record<string,number>>;
	n: number;
	/** max. consecutive consonants */
	maxcc: number;
	/** max. ocnsecutive vowels */
	maxvv: number;
}

const MND_FantasyMale:MarkovNamegenData = {
	"pairs":{"^":{"a":29,"b":11,"c":15,"d":20,"e":12,"f":11,"g":13,"h":5,"i":6,"j":13,"k":15,"l":10,"m":15,"n":10,"o":5,"p":7,"r":19,"s":22,"t":16,"u":4,"v":2,"w":7,"x":2,"y":3,"z":8,"q":1},"a":{"a":2,"r":41,"e":7,"i":6,"l":16,"g":8,"m":13,"n":43,"k":6,"c":7,"s":16,"y":6,"v":3,"f":1,"t":3,"b":1,"p":2,"$":9,"z":3,"u":4,"x":1,"w":2,"d":2,"h":1},"r":{"i":24,"o":17,"$":42,"a":21,"n":4,"l":2,"t":4,"m":2,"e":18,"k":2,"d":4,"w":1,"g":3,"r":5,"y":10,"u":3,"f":1,"s":1,"p":1,"b":1},"i":{"n":20,"a":8,"s":20,"r":10,"u":5,"l":6,"c":6,"g":3,"v":3,"t":5,"o":3,"m":6,"e":7,"$":7,"d":1,"q":1,"k":1,"x":1},"n":{"$":80,"a":13,"c":4,"i":10,"d":13,"e":13,"o":4,"t":6,"n":7,"g":1,"s":1,"j":1,"u":1,"l":1,"k":1,"z":1,"y":1},"o":{"n":31,"r":25,"p":1,"b":3,"j":1,"$":2,"y":1,"m":3,"a":3,"t":3,"l":5,"s":2,"d":2,"k":2,"g":2,"o":2,"u":1,"e":2,"x":1,"h":2,"w":1},"e":{"n":22,"r":24,"$":19,"l":18,"m":5,"e":4,"k":3,"s":7,"a":6,"d":6,"o":2,"u":1,"g":4,"t":2,"i":3,"c":1,"x":2,"y":14,"v":2,"w":1,"b":1,"p":1},"l":{"a":20,"k":1,"$":14,"h":1,"l":7,"e":12,"t":2,"f":2,"u":1,"o":5,"g":2,"i":8,"c":1,"m":2,"y":2,"n":1},"g":{"a":11,"o":3,"u":5,"e":5,"i":1,"r":3,"n":1,"h":2,"$":5,"w":2},"m":{"a":12,"m":1,"o":8,"i":6,"y":3,"e":7,"$":8,"b":3,"u":2},"k":{"i":13,"s":1,"o":2,"$":3,"a":3,"h":1,"r":2,"e":7,"l":1,"y":2},"c":{"h":5,"a":6,"l":2,"y":2,"o":7,"u":2,"e":5,"$":2,"k":3,"n":1},"h":{"$":11,"a":19,"u":3,"o":4,"r":3,"b":1,"e":5,"i":3,"k":1,"t":2,"y":1},"t":{"h":18,"r":3,"i":7,"$":9,"o":8,"e":6,"a":4,"y":2,"n":2},"s":{"$":26,"t":12,"h":13,"a":10,"m":2,"s":2,"o":7,"i":7,"y":3,"p":2,"e":2,"l":1},"u":{"r":8,"s":12,"t":2,"$":1,"l":3,"n":3,"e":2,"m":1,"g":2,"f":1,"b":3,"d":1,"i":1},"y":{"d":6,"$":24,"t":2,"n":8,"l":6,"r":5,"s":2,"o":1,"c":1,"x":1,"a":3},"d":{"e":13,"a":13,"$":7,"o":6,"r":8,"i":3,"d":2,"y":2,"s":1,"n":2},"b":{"i":4,"o":2,"r":6,"e":4,"n":1,"a":2,"u":1,"l":2,"y":2},"p":{"$":1,"a":4,"i":1,"h":4,"e":4},"v":{"i":2,"o":4,"e":3,"a":1},"f":{"a":5,"n":1,"e":3,"i":2,"$":2,"r":2,"l":1},"w":{"u":1,"e":1,"y":3,"$":3,"n":1,"h":1,"i":2,"r":2},"j":{"a":4,"e":4,"o":4,"i":1,"u":2},"z":{"u":2,"a":3,"e":2,"y":1,"i":2,"$":1,"o":1},"x":{"a":1,"$":5,"y":1,"i":1},"q":{"u":2}},
	"counts":{"^":281,"a":203,"r":166,"i":113,"n":158,"o":95,"e":148,"l":81,"g":38,"m":50,"k":35,"c":35,"h":53,"t":59,"s":87,"u":40,"y":59,"d":57,"b":24,"p":14,"v":10,"f":16,"w":14,"j":15,"z":12,"x":8,"q":2},
	"balances":{"a":{"a":42,"r":79,"i":43,"n":95,"o":28,"e":42,"l":34,"g":13,"m":22,"k":16,"c":12,"h":20,"t":20,"s":36,"u":17,"y":16,"d":16,"v":4,"f":4,"b":4,"p":4,"z":5,"x":5,"w":3},"r":{"i":43,"n":52,"o":28,"a":47,"g":9,"r":17,"l":18,"c":6,"h":10,"t":14,"s":26,"u":9,"m":11,"e":32,"y":21,"k":8,"d":8,"w":2,"f":2,"b":4,"p":3,"z":2,"x":1,"v":1},"i":{"n":36,"a":17,"s":29,"h":7,"o":14,"p":1,"r":21,"t":14,"i":6,"u":12,"l":12,"c":7,"k":3,"d":7,"g":6,"m":9,"e":23,"v":3,"b":2,"w":2,"y":6,"q":2,"x":1},"o":{"n":56,"r":37,"p":1,"a":16,"g":8,"u":7,"s":13,"i":18,"m":7,"o":9,"d":6,"b":3,"j":1,"t":7,"y":8,"h":5,"l":11,"e":8,"c":1,"k":3,"q":1,"x":2,"w":1},"e":{"n":50,"a":27,"i":25,"r":45,"t":13,"l":30,"m":10,"y":25,"h":10,"e":25,"k":6,"s":18,"o":13,"d":16,"c":4,"u":4,"w":3,"f":1,"g":11,"j":1,"x":3,"p":2,"v":2,"b":2,"z":1},"n":{"a":24,"i":27,"n":19,"k":7,"c":7,"y":11,"u":7,"s":14,"d":15,"l":7,"e":24,"r":14,"o":10,"t":9,"h":5,"f":1,"g":3,"m":4,"b":2,"j":1,"q":1,"z":1,"x":2},"l":{"a":28,"g":6,"r":14,"m":4,"k":3,"i":18,"n":25,"c":5,"h":10,"y":12,"v":1,"u":3,"s":10,"l":9,"e":21,"t":7,"f":2,"o":14,"d":5,"x":2,"w":3},"g":{"a":21,"r":17,"o":7,"n":20,"u":8,"s":8,"l":6,"t":5,"h":5,"d":5,"f":2,"e":9,"w":3,"i":7,"b":1,"m":3,"y":1},"m":{"a":17,"r":16,"m":2,"o":17,"n":16,"i":13,"c":4,"y":3,"t":5,"h":4,"e":16,"d":5,"l":5,"k":2,"u":5,"s":6,"g":4,"b":3,"q":1,"z":1,"x":1},"k":{"i":18,"n":15,"s":4,"t":6,"o":5,"r":12,"a":11,"l":10,"h":2,"e":14,"g":3,"y":6,"d":2,"m":1,"b":1,"z":1},"c":{"h":8,"a":14,"l":6,"s":8,"v":2,"i":9,"r":13,"t":4,"n":11,"c":1,"y":5,"u":5,"o":10,"m":3,"b":1,"e":13,"k":3,"p":1,"z":1},"t":{"h":18,"a":21,"s":5,"u":6,"r":21,"l":4,"i":11,"n":19,"b":2,"e":18,"t":4,"o":13,"c":3,"k":3,"z":2,"d":1,"g":2,"m":4,"y":7},"h":{"a":24,"s":6,"u":5,"r":20,"o":13,"p":2,"i":11,"t":7,"n":18,"b":1,"e":14,"c":1,"k":2,"l":9,"m":2,"g":2,"z":1,"d":3,"y":4,"w":2,"x":1,"h":1},"u":{"r":15,"s":18,"t":9,"h":2,"b":4,"e":8,"l":3,"f":2,"n":15,"a":5,"i":7,"o":3,"d":3,"m":2,"u":2,"g":3,"y":2,"c":1},"s":{"t":16,"r":20,"a":25,"l":4,"h":16,"o":19,"p":3,"v":1,"i":15,"n":31,"m":8,"d":6,"e":17,"s":6,"k":2,"c":4,"u":5,"g":2,"w":3,"y":9},"y":{"d":7,"e":11,"n":25,"t":3,"h":1,"i":3,"s":3,"l":8,"a":11,"r":8,"c":3,"o":5,"g":1,"x":1,"y":2,"k":1},"d":{"e":28,"n":29,"a":22,"c":4,"l":10,"m":7,"o":17,"r":20,"y":9,"t":5,"h":2,"k":3,"s":6,"i":8,"d":3,"f":1,"u":2,"v":1,"q":1,"w":1,"x":2},"b":{"i":8,"s":6,"h":1,"o":7,"p":1,"r":15,"a":9,"g":2,"u":2,"n":6,"e":8,"t":1,"k":3,"y":6,"l":5,"c":1},"v":{"i":3,"r":5,"u":1,"s":1,"o":4,"e":3,"c":1,"n":3,"a":3,"k":1,"l":1,"y":2},"f":{"a":9,"f":1,"n":9,"e":8,"r":12,"m":1,"i":9,"o":1,"t":2,"h":1,"c":1,"k":2,"u":1,"x":1,"s":2,"l":2,"y":2},"w":{"u":1,"l":4,"f":1,"e":6,"i":4,"r":4,"d":1,"y":4,"s":1,"t":3,"a":2,"n":9,"h":1,"o":1,"w":1},"j":{"a":9,"b":1,"r":4,"k":1,"s":4,"e":11,"g":1,"d":4,"i":4,"t":2,"o":5,"j":1,"m":1,"y":3,"n":5,"u":2,"c":1},"p":{"a":6,"s":4,"i":4,"g":1,"u":1,"e":9,"d":1,"r":6,"m":2,"h":4,"l":2,"n":5,"y":3,"o":3,"t":1,"x":1,"c":1},"z":{"u":2,"l":1,"a":6,"r":4,"e":4,"n":4,"j":1,"i":5,"b":1,"y":2,"d":1,"p":1,"h":2,"o":1},"x":{"a":2,"r":2,"f":1,"x":1,"y":1,"o":1,"n":1,"i":1,"s":1},"q":{"u":2,"e":1,"i":1,"n":2}},
	"n":281,"maxcc":4,"maxvv":2
};
const MND_FantasyFemale: MarkovNamegenData = {
	"pairs":{"^":{"a":29,"b":9,"c":14,"d":14,"e":15,"f":8,"g":8,"h":6,"i":7,"j":13,"k":14,"l":20,"m":18,"n":11,"o":3,"p":6,"q":2,"r":17,"s":26,"t":11,"u":1,"v":8,"x":1,"y":4,"w":6,"z":5},"a":{"d":7,"$":80,"i":11,"e":3,"l":12,"m":9,"n":35,"r":27,"s":11,"h":3,"b":2,"t":3,"u":3,"v":2,"p":3,"k":3,"y":5,"w":2,"c":2,"g":3,"z":1},"d":{"e":12,"r":8,"i":7,"o":7,"u":1,"d":2,"a":5,"y":2,"s":1,"n":2},"e":{"l":27,"$":35,"n":23,"r":22,"t":4,"a":6,"y":16,"s":11,"e":5,"c":1,"v":5,"m":4,"p":3,"i":4,"x":2,"w":1,"d":3,"g":1,"b":1},"l":{"a":26,"i":23,"v":3,"y":6,"e":17,"l":10,"$":9,"o":7,"u":1,"n":1,"m":1},"i":{"d":3,"e":15,"s":27,"k":5,"n":23,"l":9,"a":16,"b":1,"t":4,"v":5,"o":4,"$":8,"g":3,"z":2,"f":1,"h":1,"r":7,"q":1,"c":3,"m":2,"x":1},"r":{"i":25,"a":23,"t":3,"w":2,"n":2,"$":15,"r":7,"e":19,"l":2,"o":9,"u":1,"s":2,"d":2,"m":1,"y":9,"p":1,"b":1,"g":1},"n":{"n":11,"e":22,"$":54,"a":21,"d":9,"g":1,"i":8,"o":4,"u":2,"c":4,"y":2,"t":2,"l":1,"k":1,"z":1},"s":{"$":16,"l":2,"e":5,"h":17,"a":16,"s":9,"r":1,"m":2,"c":1,"o":7,"t":4,"y":5,"i":4,"k":1,"p":2},"k":{"o":1,"i":10,"a":5,"y":3,"e":6,"l":1,"r":1,"$":1},"o":{"$":1,"m":3,"r":12,"n":18,"l":4,"v":1,"s":1,"p":2,"t":3,"d":2,"c":1,"x":2,"g":1,"o":2,"k":1,"u":1,"e":2,"a":2,"b":2,"h":2,"w":1},"v":{"i":5,"a":10,"e":6,"$":1,"o":3},"m":{"i":11,"$":5,"a":9,"e":7,"o":3,"u":2,"y":2,"b":2},"y":{"$":28,"r":7,"n":9,"t":2,"a":5,"l":8,"v":1,"c":1,"d":4,"x":1,"s":1},"b":{"e":7,"r":6,"i":3,"a":1,"l":2,"y":2},"t":{"h":9,"i":6,"l":1,"r":2,"n":3,"t":1,"a":6,"e":4,"y":2,"o":5,"$":4},"h":{"$":9,"l":1,"a":20,"e":4,"o":3,"i":5,"r":2,"y":2,"k":1,"t":3,"u":1},"w":{"e":2,"i":4,"$":3,"y":2,"n":1,"h":1,"r":2},"c":{"a":6,"e":5,"h":4,"i":1,"l":1,"y":4,"t":2,"o":2,"k":2},"g":{"e":3,"a":8,"u":2,"w":3,"n":1,"h":1,"$":1},"f":{"e":3,"i":2,"f":1,"a":2,"l":1,"r":1},"u":{"n":3,"l":2,"r":3,"$":1,"t":1,"a":1,"b":3,"g":1,"s":3,"e":1,"d":1,"i":1},"z":{"m":1,"z":1,"i":3,"$":1,"a":2,"e":1,"o":1},"j":{"a":3,"e":5,"o":3,"u":2},"p":{"h":7,"p":1,"e":5,"y":1,"u":1,"a":3},"q":{"u":3},"x":{"a":2,"$":4,"i":1}},
	"counts":{"^":276,"a":227,"d":47,"e":174,"l":104,"i":141,"r":125,"n":143,"s":92,"k":28,"o":64,"v":25,"m":41,"y":67,"b":21,"t":43,"h":51,"w":15,"c":27,"g":19,"f":10,"u":21,"z":10,"j":13,"p":18,"q":3,"x":7},
	"balances":{"a":{"d":19,"e":55,"l":36,"a":49,"i":55,"r":49,"n":74,"s":26,"k":9,"o":12,"v":3,"m":13,"y":18,"b":6,"t":14,"h":14,"w":5,"g":5,"u":7,"c":4,"p":5,"x":3,"z":2},"d":{"e":24,"l":12,"a":23,"i":16,"d":3,"r":12,"n":25,"s":5,"h":2,"v":2,"o":11,"m":3,"k":1,"u":2,"y":9,"q":1,"w":1,"x":2},"e":{"l":40,"a":48,"i":30,"d":9,"e":33,"n":56,"r":31,"s":34,"t":10,"h":11,"y":29,"c":3,"v":6,"g":6,"m":5,"o":10,"f":2,"p":4,"k":4,"x":3,"w":1,"b":2,"z":1},"l":{"a":53,"i":41,"d":6,"e":37,"n":29,"v":3,"y":15,"s":13,"l":16,"r":12,"c":2,"t":9,"b":1,"h":6,"u":3,"z":2,"o":12,"p":2,"k":2,"x":2,"w":3,"g":1,"m":1},"i":{"d":6,"e":41,"n":45,"s":34,"k":6,"o":12,"l":23,"i":11,"a":58,"y":8,"b":3,"t":11,"h":10,"v":5,"g":3,"r":16,"z":3,"m":5,"f":2,"u":3,"q":2,"c":4,"x":1,"w":1},"r":{"i":42,"e":40,"n":35,"s":22,"a":54,"b":5,"t":6,"h":6,"w":3,"l":12,"r":10,"d":3,"g":6,"p":3,"o":12,"x":1,"u":1,"k":3,"m":3,"y":19,"c":2,"z":1,"v":1},"n":{"n":18,"e":39,"a":39,"d":11,"r":10,"h":5,"g":1,"l":8,"i":19,"u":4,"o":8,"y":15,"t":4,"s":8,"f":2,"v":1,"c":7,"k":7,"b":1,"q":1,"z":1,"m":1,"x":2},"k":{"o":1,"i":14,"n":9,"a":13,"t":2,"h":2,"e":14,"r":11,"d":3,"y":7,"l":4,"g":1,"m":1,"b":1,"s":1,"z":1},"s":{"l":12,"i":17,"n":28,"e":23,"a":52,"h":22,"y":13,"s":16,"b":1,"r":11,"m":5,"p":4,"k":2,"c":4,"d":3,"w":3,"v":3,"o":12,"t":6,"u":1},"v":{"i":10,"n":11,"a":19,"g":1,"e":12,"l":6,"y":3,"r":6,"s":2,"k":2,"p":1,"u":1,"d":2,"h":1,"o":5,"v":1,"m":1},"m":{"i":22,"l":10,"y":3,"a":27,"k":3,"n":12,"e":18,"d":7,"r":13,"s":5,"o":8,"p":1,"h":3,"g":3,"u":3,"t":3,"b":2,"q":1,"c":2,"z":1,"x":1},"b":{"e":11,"t":2,"h":2,"l":8,"i":8,"s":4,"a":9,"r":10,"y":6,"k":2,"o":3,"g":1,"n":3,"c":1},"t":{"h":9,"i":14,"s":5,"e":17,"a":24,"l":5,"n":11,"r":11,"t":2,"y":8,"v":2,"m":3,"k":1,"o":6,"c":2,"g":1,"b":1},"w":{"e":8,"n":13,"d":1,"o":2,"l":4,"y":4,"i":5,"t":3,"h":2,"a":1,"w":1,"r":3},"h":{"l":11,"e":16,"y":6,"a":34,"r":16,"n":18,"i":16,"o":9,"k":1,"t":5,"d":3,"s":9,"w":3,"v":1,"p":1,"u":1,"x":1,"h":1},"c":{"a":19,"i":8,"t":4,"l":11,"n":7,"m":2,"e":15,"s":5,"h":5,"r":11,"y":6,"v":1,"o":4,"p":1,"u":1,"k":2,"z":1},"y":{"r":13,"a":15,"n":25,"e":13,"t":2,"h":1,"l":10,"v":3,"i":5,"c":3,"s":2,"o":4,"d":4,"x":1,"y":2,"k":1},"o":{"m":4,"i":18,"k":4,"n":39,"a":21,"r":16,"l":11,"y":7,"v":2,"s":3,"e":15,"p":4,"h":6,"t":6,"d":3,"g":4,"c":1,"x":3,"o":3,"u":2,"q":1,"b":2,"w":1},"g":{"e":8,"l":7,"i":6,"n":15,"a":13,"d":3,"r":1,"m":1,"u":3,"w":3,"o":2,"y":2,"t":3,"h":2,"s":5},"f":{"e":6,"y":3,"i":6,"o":1,"n":5,"a":5,"f":1,"r":7,"s":2,"l":2,"k":1},"u":{"n":8,"d":2,"u":2,"l":3,"a":8,"r":6,"e":6,"t":6,"b":3,"i":4,"s":6,"y":2,"g":1,"o":1,"c":1},"z":{"m":1,"a":5,"z":1,"i":5,"e":5,"n":2,"p":1,"h":2,"y":1,"r":2,"o":1},"j":{"a":6,"s":5,"m":2,"i":5,"n":9,"e":14,"f":2,"r":3,"o":4,"v":1,"p":1,"h":1,"y":3,"d":2,"u":2,"t":1,"c":1},"p":{"h":7,"i":5,"n":6,"e":12,"p":1,"a":8,"l":4,"y":4,"r":6,"t":2,"u":1,"m":1,"s":2,"o":3,"x":1,"c":1},"q":{"u":3,"a":2,"r":1,"e":1,"i":1,"n":2},"x":{"a":4,"n":2,"i":1,"s":1}},
	"n":276,"maxcc":3,"maxvv":2
};
const MND_FantasyNeutral: MarkovNamegenData = {
	"pairs":{"^":{"a":44,"b":13,"c":22,"d":26,"e":19,"f":13,"g":19,"h":7,"i":11,"j":17,"k":19,"l":23,"m":25,"n":15,"o":6,"p":8,"q":2,"r":23,"s":37,"t":21,"u":5,"v":10,"x":3,"y":5,"w":7,"z":8},"a":{"d":7,"$":83,"i":12,"e":8,"l":24,"m":16,"n":56,"r":55,"s":19,"h":3,"b":3,"t":5,"u":5,"v":4,"p":4,"a":2,"g":8,"k":6,"c":7,"y":6,"f":1,"z":3,"x":1,"w":2},"d":{"e":17,"r":13,"i":9,"o":10,"u":1,"d":3,"a":14,"$":7,"y":2,"s":1,"n":2},"e":{"l":36,"$":39,"n":29,"r":33,"t":6,"a":8,"y":16,"s":14,"e":7,"c":2,"v":5,"m":6,"p":3,"i":5,"k":3,"d":6,"o":2,"u":1,"g":4,"x":2,"w":1,"b":1},"l":{"a":38,"i":25,"v":3,"y":6,"e":20,"l":12,"$":15,"o":9,"u":2,"k":1,"h":1,"t":2,"f":2,"g":2,"c":1,"m":2,"n":1},"i":{"d":3,"e":16,"s":36,"k":5,"n":35,"l":11,"a":19,"b":1,"t":7,"v":6,"o":5,"$":10,"g":5,"z":2,"f":1,"h":1,"r":12,"u":5,"c":6,"m":6,"q":1,"x":1},"r":{"i":37,"a":36,"t":6,"w":3,"n":6,"$":43,"r":8,"e":26,"l":3,"o":19,"u":4,"s":2,"d":5,"m":2,"k":2,"g":3,"y":10,"f":1,"p":1,"b":1},"n":{"n":12,"e":25,"$":88,"a":31,"d":19,"g":2,"i":13,"o":5,"u":2,"c":6,"y":2,"t":6,"s":1,"j":1,"l":1,"k":1,"z":1},"s":{"$":31,"l":2,"e":5,"h":22,"a":24,"s":10,"r":1,"m":3,"c":1,"o":9,"t":13,"y":6,"i":8,"k":1,"p":2},"k":{"o":3,"i":16,"a":8,"y":3,"s":1,"$":3,"h":1,"r":2,"e":7,"l":1},"o":{"$":3,"m":5,"r":29,"n":35,"l":7,"v":1,"s":3,"p":3,"t":4,"d":3,"c":1,"x":2,"b":3,"j":1,"y":1,"a":3,"k":2,"g":2,"o":2,"u":1,"e":2,"h":2,"w":1},"v":{"i":7,"a":10,"e":7,"$":1,"o":5},"m":{"i":14,"$":9,"a":15,"e":10,"o":9,"u":3,"y":4,"m":1,"b":3},"y":{"$":29,"r":10,"n":11,"t":3,"a":5,"l":9,"v":1,"d":6,"s":2,"o":1,"c":1,"x":1},"b":{"e":8,"r":7,"i":5,"o":2,"n":1,"a":2,"u":1,"l":2,"y":2},"t":{"h":27,"i":10,"l":1,"r":4,"n":3,"t":1,"a":9,"e":7,"y":3,"$":9,"o":8},"h":{"$":17,"l":1,"a":28,"e":9,"o":5,"i":6,"r":4,"y":2,"k":2,"t":3,"u":3,"b":1},"w":{"e":3,"i":4,"u":1,"y":3,"$":3,"n":1,"h":1,"r":2},"c":{"a":9,"e":6,"h":6,"i":1,"l":3,"y":5,"t":2,"o":7,"u":2,"$":2,"k":3,"n":1},"g":{"e":7,"a":14,"u":6,"w":4,"n":2,"o":3,"i":1,"r":3,"h":2,"$":5},"f":{"e":5,"i":3,"f":1,"a":5,"n":1,"$":2,"r":2,"l":1},"u":{"n":5,"l":5,"r":10,"$":2,"t":3,"a":1,"b":4,"s":12,"e":2,"m":1,"g":2,"f":1,"d":1,"i":1},"z":{"m":1,"z":1,"i":3,"u":2,"a":3,"e":2,"y":1,"$":1,"o":1},"j":{"a":5,"e":6,"o":5,"i":1,"u":2},"p":{"h":8,"p":1,"e":5,"y":1,"u":1,"$":1,"a":4,"i":1},"q":{"u":3},"x":{"a":3,"$":5,"y":1,"i":1}},
	"counts":{"^":408,"a":340,"d":79,"e":229,"l":142,"i":194,"r":218,"n":216,"s":138,"k":45,"o":116,"v":30,"m":68,"y":79,"b":30,"t":82,"h":81,"w":18,"c":47,"g":47,"f":20,"u":50,"z":15,"j":19,"p":22,"q":3,"x":10},
	"balances":{"a":{"d":28,"e":72,"l":58,"a":81,"i":74,"r":104,"n":124,"s":45,"k":19,"o":29,"v":6,"m":26,"y":21,"b":7,"t":27,"h":29,"w":5,"g":14,"u":19,"c":13,"p":6,"f":4,"z":5,"x":5},"d":{"e":38,"l":15,"a":38,"i":21,"d":5,"r":26,"n":37,"s":9,"h":4,"v":2,"o":21,"m":9,"k":4,"u":3,"y":10,"c":4,"t":5,"f":1,"q":1,"w":1,"x":2},"e":{"l":55,"a":62,"i":45,"d":20,"e":45,"n":74,"r":57,"s":41,"t":19,"h":18,"y":30,"c":6,"v":6,"g":12,"m":11,"o":17,"f":3,"p":4,"k":10,"u":4,"w":3,"j":1,"x":3,"b":2,"z":1},"l":{"a":71,"i":48,"d":9,"e":42,"n":40,"v":4,"y":18,"s":18,"l":18,"r":21,"c":6,"t":13,"b":1,"h":13,"u":6,"z":2,"o":18,"p":2,"k":4,"g":6,"m":4,"f":2,"x":2,"w":3},"i":{"d":11,"e":46,"n":65,"s":51,"k":7,"o":18,"l":26,"i":14,"a":66,"y":8,"b":4,"t":19,"h":14,"v":6,"g":8,"r":27,"z":3,"m":11,"f":2,"u":13,"p":1,"c":7,"w":2,"q":2,"x":1},"r":{"i":65,"e":50,"n":66,"s":39,"a":84,"b":6,"t":18,"h":15,"w":4,"l":23,"r":20,"d":10,"g":11,"p":4,"o":30,"x":2,"u":10,"k":9,"c":6,"m":11,"y":21,"f":2,"z":2,"v":1},"n":{"n":27,"e":44,"a":57,"d":21,"r":20,"h":9,"g":4,"l":11,"i":32,"u":9,"o":12,"y":16,"t":11,"s":18,"f":3,"v":1,"c":10,"k":9,"m":4,"b":2,"j":1,"q":1,"z":1,"x":2},"k":{"o":6,"i":22,"n":18,"a":19,"t":7,"h":4,"e":17,"r":16,"d":3,"y":7,"s":4,"l":10,"g":3,"m":1,"b":1,"z":1},"s":{"l":14,"i":25,"n":42,"e":29,"a":69,"h":29,"y":15,"s":18,"b":1,"r":27,"m":9,"p":5,"k":4,"c":6,"d":7,"w":4,"v":4,"o":21,"t":17,"u":5,"g":2},"v":{"i":13,"n":12,"a":21,"g":1,"e":13,"l":7,"y":3,"r":8,"s":3,"k":3,"p":1,"u":2,"d":2,"h":1,"o":7,"v":1,"m":1,"c":1},"m":{"i":28,"l":13,"y":5,"a":35,"k":4,"n":21,"e":23,"d":9,"r":23,"s":8,"o":19,"p":1,"h":6,"g":5,"u":6,"t":7,"m":2,"c":4,"b":3,"q":1,"z":1,"x":1},"b":{"e":12,"t":3,"h":3,"l":8,"i":11,"s":9,"a":13,"r":16,"o":7,"p":1,"g":2,"u":2,"n":6,"k":3,"y":6,"c":1},"t":{"h":27,"i":22,"s":10,"e":28,"a":39,"l":8,"n":22,"r":29,"t":5,"y":9,"v":2,"m":5,"k":4,"u":6,"b":2,"o":13,"c":3,"z":2,"d":1,"g":2},"w":{"e":9,"n":14,"d":2,"o":2,"l":5,"y":5,"i":6,"t":4,"h":2,"u":1,"f":1,"r":4,"s":1,"a":2,"w":1},"h":{"l":15,"e":24,"y":6,"a":47,"r":29,"n":24,"i":20,"o":14,"k":3,"t":8,"d":4,"s":12,"w":3,"v":1,"u":5,"p":2,"b":1,"c":1,"m":2,"g":2,"z":1,"x":1,"h":1},"c":{"a":27,"i":14,"t":7,"l":14,"n":13,"m":4,"e":17,"s":10,"h":9,"r":17,"y":8,"v":3,"c":1,"u":5,"o":10,"b":1,"k":3,"p":1,"z":1},"y":{"r":17,"a":20,"n":31,"e":15,"t":4,"h":2,"l":12,"v":3,"i":6,"c":4,"s":4,"o":6,"d":7,"g":1,"x":1,"y":2,"k":1},"o":{"m":9,"i":30,"k":5,"n":68,"a":30,"r":42,"l":15,"y":9,"v":2,"s":15,"e":16,"p":5,"h":8,"t":10,"d":7,"g":9,"c":2,"x":3,"u":7,"o":9,"b":3,"j":1,"q":1,"w":1},"g":{"e":15,"l":12,"i":12,"n":27,"a":28,"d":8,"r":18,"m":4,"u":10,"w":5,"o":8,"y":2,"t":6,"h":6,"s":10,"f":2,"b":1},"f":{"e":11,"y":3,"i":10,"o":2,"n":10,"a":10,"f":2,"r":14,"m":1,"t":2,"h":1,"c":1,"k":2,"u":1,"x":1,"s":2,"l":2},"u":{"n":18,"d":4,"u":3,"l":6,"a":13,"r":19,"e":10,"t":11,"b":5,"i":8,"s":18,"h":2,"f":2,"o":3,"m":2,"g":3,"y":2,"c":1},"z":{"m":1,"a":7,"z":1,"i":7,"e":6,"u":2,"l":1,"r":4,"n":4,"j":1,"b":1,"y":2,"d":1,"p":1,"h":2,"o":1},"j":{"a":11,"s":6,"m":2,"i":7,"n":9,"e":17,"f":2,"r":5,"o":7,"v":1,"p":1,"h":1,"b":1,"k":1,"g":1,"d":4,"t":2,"j":1,"y":3,"u":2,"c":1},"p":{"h":8,"i":7,"n":6,"e":14,"p":1,"a":11,"l":5,"y":4,"r":7,"t":2,"u":2,"s":4,"g":1,"d":1,"m":2,"o":3,"x":1,"c":1},"q":{"u":3,"a":2,"r":1,"e":1,"i":1,"n":2},"x":{"a":6,"n":3,"r":2,"f":1,"x":1,"y":1,"o":1,"i":1,"s":1}},
	"n":408,"maxcc":4,"maxvv":2
};

const MarkovFlavors:Record<string,Record<TGender,MarkovNamegenData>> = {
	'fantasy': {'m':MND_FantasyMale,'f':MND_FantasyFemale,'x':MND_FantasyNeutral}
}

function isvowel(s:string):boolean {
	return s === 'a' || s === 'i' || s === 'e' || s === 'o' || s === 'u';
}
function isconsonant(s:string):boolean {
	return s !== 'y' && !isvowel(s);
}

function namegenMarkov(gender:TGender, flavor:string, rng:Random):string {
	if (!(flavor in MarkovFlavors)) flavor = 'fantasy';
	let mnd = MarkovFlavors[flavor][gender];

	let length = rng.d3()+rng.d4()+rng.d5();
	let minlength = 3;
	let prev = '^';
	let s = '';
	let i = 0;
	let niter = 100;
	let cc = 0, vv = 0, nvy = 0, d = false;

	function pick(prev:string):string {
		let n = rng.nextInt(mnd.counts[prev]);
		for (let next in mnd.pairs[prev]) {
			n -= mnd.pairs[prev][next];
			if (n <= 0) return next;
		}
		return '<?'+prev+'?>'
	}

	while (niter-->0) {
		// pick 2 follow-ups and select most fitting
		let next1 = pick(prev);
		let next2 = pick(prev);
		let next;
		if (next1 === '$') {
			next = next2;
		} else if (next2 === '$') {
			next = next1;
		} else if (prev === '^') {
			next = rng.nextBoolean() ? next1 : next2;
		} else {
			// pick by "balance", pick letter most "liked" by previous
			let b1 = 0, b2 = 0;
			for (let c of s) {
				b1 += (mnd.balances[c] ?? {})[next1] ?? 0;
				b2 += (mnd.balances[c] ?? {})[next2] ?? 0;
			}
			next = b1 > b2 ? next1 : next2;
		}
		// reroll if...
		if (d && next === prev) continue; // repeating same letter 3 times
		if (isvowel(next) && vv >= mnd.maxvv) continue; // too many consecutive vowels
		if (isconsonant(next) && cc >= mnd.maxcc) continue; // same for consonants

		if (isvowel(next) || next === 'y') nvy++;
		if (isvowel(next)) vv++; else vv = 0;
		if (isconsonant(next)) cc++; else cc = 0;
		d = next === prev;

		if (next === '$') {
			if (nvy === 0) continue; // reroll if no vowels or 'y'
			if (i >= length) {
				// offer end after reaching required length
				break;
			}
			// offer end before required length
			if (i < minlength) continue;
			else if (i === length - 1 && rng.nextBoolean()) continue; // can stop one letter short
			else continue;
		} else if (i >= length && next !== '$' && nvy > 0) {
			// no end after reaching required length
			if (i === length) {
				if (rng.nextBoolean()) continue; // can stop one letter extra
			} else {
				break;
			}
		}
		if (next === '$') break;
		if (next.includes('?')) break;
		s += next;
		prev = next;
		i++;
	}
	if (s.length === 0) return '';
	s = s[0].toUpperCase()+s.slice(1)
	return s;
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
	let n = rng.d3()+rng.d6();
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
