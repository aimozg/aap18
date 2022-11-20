/*
 * Created by aimozg on 20.11.2022.
 */


export function signValue<T>(value:number, negative:T, zero:T, positive:T):T {
	return value > 0 ? positive : value < 0 ? negative : zero;
}
