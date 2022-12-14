/*
 * Created by aimozg on 03.12.2022.
 */

import {RGBColor} from "../objects/Color";
import * as tinycolor from "tinycolor2";
import {lint} from "../math/utils";

export function createCanvas(w: number, h: number, fill?: string): CanvasRenderingContext2D {
	let c = document.createElement("canvas");
	c.width = w;
	c.height = h;
	let c2d = c.getContext('2d')!;
	if (fill) {
		c2d.fillStyle = fill;
		c2d.fillRect(0, 0, w, h);
	}
	return c2d;
}

export interface AnimatedColor1 {
	fx: "brighten" | "darken";
	speed: "normal" | "fast" | "blink" | "fblink" | "slow";
	color: RGBColor;
}

export interface AnimatedColor2 {
	fx: "tween";
	speed: "normal" | "fast" | "slow";
	colors: RGBColor[]
}

export type AnimatedColor = string | RGBColor | AnimatedColor1 | AnimatedColor2;

export function animatedColorToRGB(color: AnimatedColor, phase: number): RGBColor {
	if (color instanceof tinycolor) {
		return color;
	}
	if (typeof color === 'string') {
		return tinycolor(color);
	}
	switch (color.speed) {
		case "normal":
			// phase = phase
			break;
		case "fast":
			phase = phase * 2;
			break;
		case "slow":
			phase = phase / 2;
			break;
		case "blink":
			phase = (phase - Math.floor(phase)) > 0.75 ? 0.5 : 0;
			break;
		case "fblink":
			phase = phase * 2;
			phase = (phase - Math.floor(phase)) > 0.75 ? 0.5 : 0;
			break;
	}
	phase = phase - Math.floor(phase);
	switch (color.fx) {
		case "tween":
			if (color.colors.length === 0) throw new Error(`No colors specified`)
			if (color.colors.length === 1) return color.colors[0];
			// 0..1 -> 0..N
			phase = color.colors.length;
			let i = Math.floor(phase), f = phase - i;
			if (f === 0) return color.colors[i];
			let color1 = color.colors[i].toRgb(), color2 = color.colors[i].toRgb();
			return tinycolor({
				r: lint(f, color1.r, color2.r),
				g: lint(f, color1.g, color2.g),
				b: lint(f, color1.b, color2.b),
				a: lint(f, color1.a, color2.a),
			})
		case "brighten":
			// a /\ graph between (0,0), (0.5,1) and (1,0)
			phase = 1 - Math.abs(phase - 0.5) * 2;
			return color.color.clone().brighten(phase * 50);
		case "darken":
			phase = 1 - Math.abs(phase - 0.5) * 2;
			return color.color.clone().darken(phase * 50);
	}
}

