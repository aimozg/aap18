/*
 * Created by aimozg on 04.07.2022.
 */
export type TSex = 'n' | 'm' | 'f' | 'h'/* | 'x'*/;
export const SEX_NONE = 'n';
export const SEX_MALE = 'm';
export const SEX_FEMALE = 'f';
export const SEX_BOTH = 'h';
/*export const SEX_OTHER = 'x';*/
export const SEXES: TSex[] = ['n', 'm', 'f', 'h'/*, 'x'*/];

export type TGender = 'm' | 'f' | 'x';
export const GENDER_MALE = 'm';
export const GENDER_FEMALE = 'f';
export const GENDER_OTHER = 'x';
export const GENDERS: TGender[] = ['m', 'f', 'x'];
