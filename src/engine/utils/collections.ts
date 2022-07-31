/*
 * Created by aimozg on 21.07.2022.
 */

export function createArray<T>(size:number, initializer: (i:number, array:T[])=>T):T[] {
	let arr = Array<T>(size);
	for (let i = 0; i < size; i++) arr[i] = initializer(i, arr);
	return arr;
}
