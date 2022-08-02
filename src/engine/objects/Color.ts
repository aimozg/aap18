/*
 * Created by aimozg on 28.07.2022.
 */
export class Color {
	constructor(
		public name: string,
		public rgb: string
	) {}

	equals(other:Color):boolean {
		if (this === other) return true;
		if (other === null) return false;
		return this.name === other.name && this.rgb === other.rgb;
	}

	static DEFAULT_WHITE = new Color("white", "#ffffff")
}
