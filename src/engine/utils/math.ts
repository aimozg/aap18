/*
 * Created by aimozg on 20.11.2022.
 */

export const DEG2RAD = Math.PI/180;
export const RAD2DEG = 180/Math.PI;

export function signValue<T>(value:number, negative:T, zero:T, positive:T):T {
	return value > 0 ? positive : value < 0 ? negative : zero;
}
export function signClass(value:number):string {
	return signValue(value,'text-negative','','text-positive');
}
