/*
 * Created by aimozg on 28.07.2022.
 */
import * as tinycolor from "tinycolor2";

export class Color {
	constructor(
		public name: string,
		public rgb: string
	) {}

	hsv: tinycolor.ColorFormats.HSVA = tinycolor(this.rgb).toHsv()

	equals(other:Color):boolean {
		if (this === other) return true;
		if (other === null) return false;
		return this.name === other.name && this.rgb === other.rgb;
	}

	static DEFAULT_WHITE = new Color("white", "#ffffff")
}

/**
 * Key to sort the colors in order "desaturated black-to-white, then saturated by hue"
 */
export function colorSortKey(c:Color):number {
	let {h,s,v} = c.hsv;
	h = (h+30)%360;
	if (s < 0.2 || v < 0.33) return (v + s * h / 3600)
	return 10 + (h + s * c.hsv.v/10)/360
}
