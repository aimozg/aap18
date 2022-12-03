/*
 * Created by aimozg on 03.12.2022.
 */

import {AnimatedColor, animatedColorToRGB} from "../../utils/canvas";

export interface HexCell {
	border?: AnimatedColor;
	borderWidth?: number;
	fill?: AnimatedColor;
	text?: string;
	fontSize?: number;
	fontFace?: string;
	textColor?: AnimatedColor;
}

// TODO move to separate readme?
/**
 * The hex grid can be viewed as a rectangular grid of 2x2 blocks, where every other row/column is offset by 1. Start index is (0,0).
 *
 * orientation = "horiz":
 * <pre>
 *    0 1 2 3 4 5      0 1 2 3 4 5
 *    ╱ ╲ ╱ ╲ ╱ ╲     ┬─┴─┬─┴─┬─┴─┬
 * 0 │0,0│2,0│4,0│  0 │0,0│2,0│4,0│
 * 1 │   │   │   │  1 │   │   │   │
 *    ╲ ╱ ╲ ╱ ╲ ╱     ┴─┬─┴─┬─┴─┬─┴
 * 2   │1,2│3,2│    2   │1,2│3,2│
 * 3   │   │   │    3   │   │   │
 *    ╱ ╲ ╱ ╲ ╱ ╲     ┬─┴─┬─┴─┬─┴─┬
 * 4 │0,4│0,4│0,4│  4 │0,4│2,4│4,4│
 * 5 │   │   │   │  5 │   │   │   │
 *    ╲ ╱ ╲ ╱ ╲ ╱     ┴─┬─┴─┬─┴─┬─┴
 * 6   │1,6│1,6│    6   │1,6│3,6│
 * 7   │   │   │    7   │   │   │
 *      ╲ ╱ ╲ ╱       ┬─┴─┬─┴─┬─┴─┬
 * </pre>
 * Y coordinates are always even, X are even on rows 4n and odd on rows 4n+2.
 *
 * orientation = "vert":
 * <pre>
 *     0 1 2 3 4 5       0 1 2 3 4 5
 *     ⟩─⟨     ⟩─⟨      ├───┤   ├───┤
 * 0  ╱   ╲   ╱   ╲   0 │0,0│   │4,0│
 *   ⟨ 0,0 ⟩─⟨ 4,0 ⟩    ┤   ├───┤   ├
 * 1  ╲   ╱   ╲   ╱   1 │   │2,1│   │
 *     ⟩─⟨ 2,1 ⟩─⟨      ├───┤   ├───┤
 * 2  ╱   ╲   ╱   ╲   2 │0,2│   │4,2│
 *   ⟨ 0,2 ⟩─⟨ 4,2 ⟩    ┤   ├───┤   ├
 * 3  ╲   ╱   ╲   ╱   3 │   │2,3│   │
 *     ⟩─⟨ 2,3 ⟩─⟨      ├───┤   ├───┤
 * 4  ╱   ╲   ╱   ╲   4 │0,4│   │4,4│
 *   ⟨ 0,4 ⟩─⟨ 4,4 ⟩    ┤   ├───┤   ├
 * 5  ╲   ╱   ╲   ╱   5 │   │2,5│   │
 *     ⟩─⟨ 2,5 ⟩─⟨      ├───┤   ├───┤
 * 6      ╲   ╱       6 │   │   │   │
 *         ⟩─⟨          ┤   ├───┤   ├
 * </pre>
 * X coordinates are even, Y are even on columns 4n and odd on columns 4n+2
 */
export type HexMapOrientation = 'horiz'|'vert';

export interface HexMap {
	orientation: HexMapOrientation;
	left: number;
	right: number;
	top: number;
	bottom: number;
	cellAt(x:number, y:number): HexCell|undefined;
}

function hexagon(orientation:HexMapOrientation, sideLength:number, bumpLength:number, halfOffLength:number):Path2D {
	let path = new Path2D();
	if (orientation === "vert") {
		path.moveTo(bumpLength, 0);
		path.lineTo(bumpLength + sideLength, 0);
		path.lineTo(bumpLength + sideLength + bumpLength, halfOffLength);
		path.lineTo(bumpLength + sideLength, 2*halfOffLength);
		path.lineTo(bumpLength, 2*halfOffLength);
		path.lineTo(0, halfOffLength);
		path.closePath();
	} else {
		path.moveTo(halfOffLength, 0);
		path.lineTo(2*halfOffLength, bumpLength);
		path.lineTo(2*halfOffLength, bumpLength + sideLength);
		path.lineTo(halfOffLength, bumpLength + sideLength + bumpLength);
		path.lineTo(0, bumpLength + sideLength);
		path.lineTo(0, bumpLength);
		path.closePath();
	}
	return path;
}

export class HexCanvas {
	constructor(
		public readonly orientation:HexMapOrientation
	) {}

	// TODO move to config
	gap = 1;
	borderWIdth = 2;
	fontFace: string = "monospace";
	fontSize: number = 32;
	isHoriz = this.orientation === "horiz"
	background = "#333333"
	textColor = "#cccccc"
	/**
	 * <pre>
	 * main axis →
	 * off axis ↓
	 *
	 *    │←A→│←B→│
	 *    ⟩───⟨   │
	 *   ╱     ╲  │
	 *  ╱       ╲ │
	 * ⟨         ⟩──
	 *  ╲       ╱  ↑ C
	 *   ╲     ╱   ↓
	 *    ⟩───⟨─────
	 * </pre>
	 * `A = sideLength`, `B = bumpLength`, `C = halfOffLength`,
	 * `A+2*B = fullLength`, `fullLength/2 = halfLength`, `2*C = fullOffLength`
	 *
	 * For horizontally oriented, sideLength is side of the left/right side.
	 */
	sideLength = 72
	bumpLength = this.sideLength / 2 /* * Math.cos(DEG2RAD * 60) = 1/2 */
	halfOffLength = this.sideLength * Math.sqrt(3) / 2 /* * Math.sin(DEG2RAD * 60) = sqrt(3)/2 */
	fullLength = this.sideLength + 2*this.bumpLength
	halfLength = this.fullLength/2
	fullOffLength = 2*this.halfOffLength;
	hexPath = hexagon(this.orientation,this.sideLength, this.bumpLength, this.halfOffLength);
	subcellMainSize = (this.fullLength - this.bumpLength + 2*this.gap)/2
	subcellOffSize = (this.fullOffLength + 2*this.gap)/2
	subcellWidth = this.isHoriz ? this.subcellOffSize : this.subcellMainSize;
	subcellHeight = this.isHoriz ? this.subcellMainSize : this.subcellOffSize;
	centerX = this.isHoriz ? this.halfOffLength : this.halfLength
	centerY = this.isHoriz ? this.halfLength : this.halfOffLength

	renderCell(c2d:CanvasRenderingContext2D, cell:HexCell, phase:number, x:number, y:number) {
		c2d.save()
		c2d.translate(x, y);
		if (cell.fill) {
			c2d.fillStyle = animatedColorToRGB(cell.fill, phase).toString();
			c2d.fill(this.hexPath)
		}
		if (cell.border) {
			c2d.lineWidth = cell.borderWidth ?? this.borderWIdth;
			c2d.strokeStyle = animatedColorToRGB(cell.border, phase).toString();
			c2d.stroke(this.hexPath)
		}
		if (cell.text) {
			// TODO multi-line, differently styled text
			c2d.font = (cell.fontSize ?? this.fontSize) + "px "+ (cell.fontFace ?? this.fontFace);
			c2d.fillStyle = animatedColorToRGB(cell.textColor ?? this.textColor, phase).toString();
			let metrics = c2d.measureText(cell.text);
			c2d.fillText(cell.text, this.centerX-metrics.width/2, this.centerY, this.subcellWidth*2);
		}
		c2d.restore();
	}

	render(canvas:HTMLCanvasElement, source:HexMap, phase: number) {
		const c2d = canvas.getContext("2d")!;
		if (this.orientation !== source.orientation) throw new Error(`HexCanvas is ${this.orientation}, but its source is ${source.orientation}`)
		let isHoriz = this.isHoriz;

		let xsz = source.right - source.left;
		let ysz = source.bottom - source.top;
		let width, height;
		if (isHoriz) {
			width = (xsz + 0.5) * 2 * this.subcellWidth + 2 * this.gap;
			height = ysz * this.subcellHeight + 2 * this.bumpLength;
		} else {
			width = ysz * this.subcellHeight + 2 * this.bumpLength;
			height = (xsz + 0.5) * 2 * this.subcellWidth + 2 * this.gap;
		}

		if (canvas.width < width) canvas.width = Math.round(width);
		if (canvas.width < canvas.clientWidth) canvas.width = canvas.clientWidth;
		if (canvas.height < width) canvas.height = Math.round(height);
		if (canvas.height < canvas.clientHeight) canvas.height = canvas.clientHeight;

		c2d.fillStyle = this.background;
		c2d.fillRect(0, 0, width, height);

		let mainIndexStart,mainIndexEnd,offIndexStart,offIndexEnd;
		if (isHoriz) {
			// Go by rows
			mainIndexStart = source.top;
			mainIndexEnd = source.bottom;
			offIndexStart = source.left&~1; // ensure even
			offIndexEnd = source.right;
		} else {
			// Go by columns
			mainIndexStart = source.left;
			mainIndexEnd = source.right;
			offIndexStart = source.top&~1; // ensure even
			offIndexEnd = source.bottom;
		}
		for (let mainIndex = mainIndexStart; mainIndex < mainIndexEnd; mainIndex += 2) {
			let offIndex = offIndexStart&~1;
			if (mainIndex%4 === 2) offIndex++;
			for (; offIndex < offIndexEnd; offIndex += 2) {
				let x,y;
				if (isHoriz) {
					y = mainIndex;
					x = offIndex;
				} else {
					x = mainIndex;
					y = offIndex;
				}
				let cell = source.cellAt(x,y);
				if (cell) {
					this.renderCell(c2d, cell, phase, this.gap + x * this.subcellWidth, this.gap + y * this.subcellHeight);
				}
			}
		}
	}
}
