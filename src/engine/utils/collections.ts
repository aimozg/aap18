/*
 * Created by aimozg on 21.07.2022.
 */

export function createArray<T>(size:number, initializer: (i:number, array:T[])=>T):T[] {
	let arr = Array<T>(size);
	for (let i = 0; i < size; i++) arr[i] = initializer(i, arr);
	return arr;
}
export function createRecord<K extends string|number|symbol,V>(pairs:[K,V][]):Record<K,V> {
	let result = {} as Record<K,V>;
	for (let [k,v] of pairs) result[k] = v;
	return result;
}

export function obj2map<K extends string|number|symbol,V>(obj:{
	[index in K]?:V
}):Map<K,V> {
	let map = new Map<K,V>();
	for (let [k,v] of Object.entries(obj) as [K,V][]) {
		map.set(k,v);
	}
	return map;
}
