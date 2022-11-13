/*
 * Created by aimozg on 21.07.2022.
 */
export function coerce(value:number, min:number, max:number):number {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}
export const atLeast = Math.max;
export const atMost = Math.min;
/** Linear interpolation */
export function lint(t:number, x1:number, x2:number):number {
	return x1 + (x2-x1)*t;
}