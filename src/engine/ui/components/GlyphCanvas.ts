/*
 * Created by aimozg on 21.10.2022.
 */

import {RGBColor} from "../../objects/Color";
import {AnimatedColor, animatedColorToRGB} from "../../utils/canvas";
import {LogManager} from "../../logging/LogManager";
import {AbstractCanvasLayer, LayeredCanvas, LayeredCanvasOptions} from "../../utils/LayeredCanvas";

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
export const EmptyGlyphSource: GlyphSource = Object.freeze({
	width: 0,
	height: 0,
	glyphAt(x: number, y: number): GlyphData | null {
		return null
	},
	overlays(): CanvasOverlay[] {
		return []
	}
})

export interface ICanvasOverlay {
	hide?: boolean;
	row: number;
	col: number;
}
export interface StyledTextSpan {
	color: AnimatedColor;
	font: string;
	text: string;
}
export interface CanvasOverlayGlyph extends ICanvasOverlay {
	type: "glyph";
	glyph: GlyphData;
}
export interface CanvasOverlayText extends ICanvasOverlay {
	type: "text";
	text: StyledTextSpan[];
}
export interface CanvasOverlayImage extends ICanvasOverlay {
	type: "image";
	image: CanvasImageSource;
}

export type CanvasOverlay = CanvasOverlayGlyph | CanvasOverlayImage | CanvasOverlayText;

export class GlyphLayer extends AbstractCanvasLayer {
	constructor(id: string,
				public readonly gc: GlyphCanvas) {
		super(id);
	}

	drawTo(dst: CanvasRenderingContext2D): void {
		dst.font = this.gc.font;
		dst.textBaseline = "middle";
		dst.textAlign = "center";
		let source = this.gc.source;
		for (let row = 0; row < source.height; row++) {
			for (let col = 0; col < source.width; col++) {
				let glyph = source.glyphAt(col, row);
				if (glyph) this.gc.renderGlyph(glyph, col, row);
			}
		}
	}
}

export class GlyphOverlayLayer extends AbstractCanvasLayer {
	constructor(id: string,
	            public readonly gc: GlyphCanvas) {
		super(id);
	}

	drawTo(dst: CanvasRenderingContext2D): void {
		for (let overlay of this.gc.source.overlays?.() ?? []) {
			if (overlay.hide) continue;
			this.renderOverlay(dst, overlay);
		}
	}

	renderOverlay(c2d: CanvasRenderingContext2D, overlay: CanvasOverlay) {
		let x = this.gc.col2x(overlay.col);
		let y = this.gc.row2y(overlay.row);
		switch (overlay.type) {
			case "image":
				c2d.drawImage(overlay.image, x, y);
				break;
			case "glyph":
				c2d.font = this.gc.font;
				this.gc.renderGlyph(overlay.glyph, overlay.col, overlay.row);
				break;
			case "text":
				for (let span of overlay.text) {
					c2d.font = span.font;
					let color = animatedColorToRGB(span.color, this.gc.phase);
					c2d.strokeStyle = color.isDark() ? "#aaa" : "#333";
					c2d.lineWidth = 1;
					c2d.strokeText(span.text, x, y);
					c2d.fillStyle = color.toString();
					c2d.fillText(span.text, x, y);
					x += c2d.measureText(span.text).width;
				}
				break;
		}
	}

}

export class GlyphCanvas extends LayeredCanvas {
	constructor(
		public source: GlyphSource,
		options?: Partial<LayeredCanvasOptions>
	) {
		super(options);
		this.addLayer(new GlyphLayer("glyphs", this));
		this.addLayer(new GlyphOverlayLayer("overlays", this));
		this.fill ??= "#333333";
	}

	// TODO move to config
	font = "32px monospace"
	// Cell size in pixel
	cellWidth = 36
	cellHeight = 36
	// Text offset
	x0 = 0
	y0 = 0
	// Pixels
	padding = 8

	col2x(col:number):number {
		return col * this.cellWidth
	}
	row2y(row:number):number {
		return row * this.cellHeight
	}
	get gridWidth():number {
		return this.source.width*this.cellWidth;
	}
	get gridHeight():number {
		return this.source.height*this.cellHeight;
	}
	renderGlyph(glyph: GlyphData, col: number, row: number, c2d: CanvasRenderingContext2D = this.c2d) {
		let x = this.col2x(col);
		let y = this.row2y(row);
		if (glyph.bg) {
			c2d.fillStyle = animatedColorToRGB(glyph.bg, this.phase).toString();
			c2d.fillRect(x, y, this.cellWidth, this.cellHeight)
		}
		if (glyph.ch && glyph.ch !== ' ') {
			c2d.fillStyle = animatedColorToRGB(glyph.fg, this.phase).toString();
			c2d.fillText(glyph.ch, this.x0 + this.cellWidth/2 + x, y + this.y0 + this.cellHeight/2)
		}
	}

	autoCenter() {
		this.setCenter({x: this.gridWidth / 2, y: this.gridHeight / 2});
	}
	zoomOutToShowGrid() {
		this.zoomOutToShow({
			top: 0,
			left: 0,
			bottom: this.gridHeight,
			right: this.gridWidth,
		}, this.padding);
	}
}

const logger = LogManager.loggerFor("engine.ui.components.GlyphCanvas")
