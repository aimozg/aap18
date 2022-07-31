/*
 * Created by aimozg on 21.07.2022.
 */
export function coerce(value:number, min:number, max:number):number {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}
