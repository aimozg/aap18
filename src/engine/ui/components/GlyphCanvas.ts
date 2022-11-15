/*
 * Created by aimozg on 21.10.2022.
 */

import {RGBColor} from "../../objects/Color";
import * as tinycolor from "tinycolor2";
import {coerce, lint} from "../../math/utils";
import {milliTime} from "../../utils/time";

export interface GlyphAnimatedColor1 {
	fx: "brighten" | "darken";
	speed: "normal" | "fast" | "blink" | "fblink" | "slow";
	color: RGBColor;
}
export interface GlyphAnimatedColor2 {
	fx: "tween";
	speed: "normal" | "fast" | "slow";
	colors: RGBColor[]
}
export type GlyphColor = string | RGBColor | GlyphAnimatedColor1 | GlyphAnimatedColor2;

export function glyphColorToRGB(color:GlyphColor, phase:number):RGBColor {
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
			phase = phase*2;
			break;
		case "slow":
			phase = phase/2;
			break;
		case "blink":
			phase = (phase-Math.floor(phase)) > 0.75 ? 0.5 : 0;
			break;
		case "fblink":
			phase = phase*2;
			phase = (phase-Math.floor(phase)) > 0.75 ? 0.5 : 0;
			break;
	}
	phase = coerce(phase, 0, 1);
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
			return color.color.brighten(phase * 10);
		case "darken":
			phase = 1 - Math.abs(phase - 0.5) * 2;
			return color.color.darken(phase * 10);
	}
}

export interface GlyphData {
	ch: string;
	fg: GlyphColor;
	bg?: RGBColor|null;
}

export interface GlyphSource {
	width: number;
	height: number;
	glyphAt(x:number, y:number):GlyphData|null;
}

export type GlyphCanvasSizing = "force"|"fit"

export function createCanvas(w:number, h:number, fill?:string):CanvasRenderingContext2D {
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

export class GlyphCanvas {
	constructor(private readonly c2d: CanvasRenderingContext2D,
	            public sizing:GlyphCanvasSizing) {
	}
	// TODO move to config
	font = "32px monospace"
	// Cell size in pixel
	cellWidth = 36
	cellHeight = 36
	// Text offset
	x0 = 10
	y0 = -7
	// Empty space
	padding = 0
	// Canvas size in cells
	windowWidth = 28
	windowHeight = 20
	background = "#333333"

	// TODO make it pixels
	scrollX = 0
	scrollY = 0

	phase = 0;
	animationSpeed = 1;
	animated = false;

	get width() { return this.windowWidth*this.cellWidth + this.padding*2 }
	set width(value:number) {
		if (this.sizing === "force") return;
		this.windowWidth = (value-this.padding*2)/this.cellWidth;
	}
	get height() { return this.windowHeight*this.cellHeight + this.padding*2 }
	set height(value:number) {
		if (this.sizing === "force") return;
		this.windowHeight = (value-this.padding*2)/this.cellHeight;
	}

	scroll(dx:number, dy:number) {
		this.scrollX += dx
		this.scrollY += dy
	}

	renderGlyph(glyph:GlyphData, x:number, y:number) {
		const c2d = this.c2d;
		if (glyph.bg) {
			c2d.fillStyle = glyphColorToRGB(glyph.bg, this.phase).toString();
			c2d.fillRect(x, y, this.cellWidth, this.cellHeight)
		}
		if (glyph.ch && glyph.ch !== ' ') {
			c2d.fillStyle = glyphColorToRGB(glyph.fg, this.phase).toString();
			c2d.fillText(glyph.ch, this.x0 + x, y + this.y0 + this.cellHeight)
		}
	}
	render(source:GlyphSource) {
		this.phase = this.animationSpeed*milliTime()/1000;
		const c2d = this.c2d;
		const canvas = c2d.canvas;
		switch (this.sizing) {
			case "force":
				if (canvas.width < this.width) canvas.width = this.width;
				if (canvas.height < this.height) canvas.height = this.height;
				break;
			case "fit":
				if (this.width !== canvas.clientWidth || this.height !== canvas.clientHeight) {
					// adjust scroll maintaining center position
					this.scrollX += (this.width - canvas.clientWidth)/this.cellWidth/2;
					this.scrollY += (this.height - canvas.clientHeight)/this.cellHeight/2;
					this.scrollX |= 0;
					this.scrollY |= 0;
					this.width = canvas.width = canvas.clientWidth;
					this.height = canvas.height = canvas.clientHeight;
				}
				break;
		}

		c2d.fillStyle = this.background;
		c2d.fillRect(0, 0, this.width, this.height);
		c2d.font = this.font;

		let maxRow = Math.min(source.height, this.scrollY + this.windowHeight)
		let maxCol = Math.min(source.width, this.scrollX + this.windowWidth)
		let y = this.padding
		for (let row = this.scrollY; row < maxRow; row++) {
			let x = this.padding
			for (let col = this.scrollX; col < maxCol; col++) {
				let glyph = source.glyphAt(col, row);
				if (glyph) this.renderGlyph(glyph, x, y)
				x += this.cellWidth
			}
			y += this.cellHeight
		}
		if (document.contains(c2d.canvas) && this.animated) {
			requestAnimationFrame(()=>this.render(source));
		}
	}
}
