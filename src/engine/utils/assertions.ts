/*
 * Created by aimozg on 29.11.2022.
 */

export function assertInt(value:number, valueName:string="Value"):number {
	if (!isFinite(value)) throw new Error(`${valueName} (${value}) must be finite`)
	return value|0;
}
export function assertNonNegativeInt(value:number, valueName:string="Value"):number {
	if (!isFinite(value) || value <= 0) throw new Error(`${valueName} (${value}) must be non-negative`)
	return value|0;
}
