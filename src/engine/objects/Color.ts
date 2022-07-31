/*
 * Created by aimozg on 28.07.2022.
 */
export class Color {
	constructor(
		public name: string,
		public rgb: string
	) {}

	static DEFAULT_WHITE = new Color("white", "#ffffff")
}
