/*
 * Created by aimozg on 21.10.2022.
 */

import {RGBColor} from "../../objects/Color";
import {milliTime} from "../../utils/time";
import {AnimatedColor, animatedColorToRGB} from "../../utils/canvas";

export interface GlyphData {
	ch: string;
	fg: AnimatedColor;
	bg?: RGBColor | null;
}

export interface GlyphSource {
	width: number;
	height: number;

	glyphAt(x: number, y: number): GlyphData | null;

	overlays?(): CanvasOverlay[];
}

export type GlyphCanvasSizing = "force" | "fit"

export interface ICanvasOverlay {
	hide?: boolean;
	row: number;
	col: number;
}

export interface CanvasOverlayGlyph extends ICanvasOverlay {
	type: "glyph";
	glyph: GlyphData;
}

export interface CanvasOverlayImage extends ICanvasOverlay {
	type: "image";
	image: CanvasImageSource;
}

export type CanvasOverlay = CanvasOverlayGlyph | CanvasOverlayImage;

export class GlyphCanvas {
	constructor(private readonly c2d: CanvasRenderingContext2D,
	            public sizing: GlyphCanvasSizing) {
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

	beforeRender: (() => void) | null = null;
	afterRender: (() => void) | null = null;

	get width() {
		return this.windowWidth * this.cellWidth + this.padding * 2
	}

	set width(value: number) {
		if (this.sizing === "force") return;
		this.windowWidth = (value - this.padding * 2) / this.cellWidth;
	}

	get height() {
		return this.windowHeight * this.cellHeight + this.padding * 2
	}

	set height(value: number) {
		if (this.sizing === "force") return;
		this.windowHeight = (value - this.padding * 2) / this.cellHeight;
	}

	scroll(dx: number, dy: number) {
		this.scrollX += dx
		this.scrollY += dy
	}

	renderGlyph(glyph: GlyphData, x: number, y: number) {
		const c2d = this.c2d;
		if (glyph.bg) {
			c2d.fillStyle = animatedColorToRGB(glyph.bg, this.phase).toString();
			c2d.fillRect(x, y, this.cellWidth, this.cellHeight)
		}
		if (glyph.ch && glyph.ch !== ' ') {
			c2d.fillStyle = animatedColorToRGB(glyph.fg, this.phase).toString();
			c2d.fillText(glyph.ch, this.x0 + x, y + this.y0 + this.cellHeight)
		}
	}

	renderOverlay(overlay: CanvasOverlay) {
		let x = (overlay.col - this.scrollX) * this.cellWidth + this.padding;
		let y = (overlay.row - this.scrollY) * this.cellHeight + this.padding;
		switch (overlay.type) {
			case "image":
				this.c2d.drawImage(overlay.image, x, y);
				break;
			case "glyph":
				this.c2d.font = this.font;
				this.renderGlyph(overlay.glyph, x, y);
				break;
		}
	}

	render(source: GlyphSource) {
		this.beforeRender?.();
		this.phase = this.animationSpeed * milliTime() / 1000;
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
					this.scrollX += (this.width - canvas.clientWidth) / this.cellWidth / 2;
					this.scrollY += (this.height - canvas.clientHeight) / this.cellHeight / 2;
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

		for (let overlay of source.overlays?.() ?? []) {
			if (overlay.hide) continue;
			this.renderOverlay(overlay);
		}

		this.afterRender?.();
	}
}
