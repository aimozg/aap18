/*
 * Created by aimozg on 13.07.2022.
 */

import {
	GENDER_FEMALE,
	GENDER_MALE,
	GENDER_OTHER,
	SEX_BOTH,
	SEX_FEMALE,
	SEX_MALE,
	SEX_NONE,
	TGender,
	TSex
} from "../../../engine/rules/gender";

export interface IPronouns {
	they: string;
	them: string;
	their: string;
	theirs: string;
	themselves: string;
}

export let Pronouns: Record<TGender, IPronouns> = {
	[GENDER_MALE]: {they: 'he', them: 'him', their: 'his', theirs: 'his', themselves: 'himself'},
	[GENDER_FEMALE]: {they: 'she', them: 'her', their: 'her', theirs: 'hers', themselves: 'herself'},
	[GENDER_OTHER]: {they: 'they', them: 'them', their: 'their', theirs: 'theirs', themselves: 'themselves'},
}

export let SexNames: Record<TSex, string> = {
	[SEX_NONE]: 'sexless',
	[SEX_MALE]: 'male',
	[SEX_FEMALE]: 'female',
	[SEX_BOTH]: 'futanari',
}
