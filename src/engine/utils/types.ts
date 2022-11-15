/*
 * Created by aimozg on 03.08.2022.
 */

// export type KeysOfType<R, T> = keyof R & keyof

export type PartialRecord<K extends keyof any, T> =  Partial<Record<K, T>>
