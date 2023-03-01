/*
 * Created by aimozg on 28.02.2023.
 */

import {createCanvas} from "./canvas";
import {coerce, logarithm} from "../math/utils";
import {XY, XYRect} from "./geom";
import {getComputedBoxes} from "./dom";
import {LogManager} from "../logging/LogManager";
import {milliTime} from "./time";

// TODO move to utils
export type UIEventModifier = null | "shift" | "ctrl" | "alt";
export function eventHasMod(mod:UIEventModifier, e:MouseEvent|KeyboardEvent):boolean {
	let {ctrlKey,shiftKey,altKey} = e;
	switch (mod) {
		case null: return !ctrlKey && !shiftKey && !altKey;
		case "shift": return !ctrlKey && shiftKey && !altKey;
		case "ctrl": return ctrlKey && !shiftKey && !altKey;
		case "alt": return !ctrlKey && !shiftKey && altKey;
	}
	return false;
}

export interface LayeredCanvasOptions {
	viewportWidth: number;
	viewportHeight: number;

	zoom: number;
	minZoom: number;
	maxZoom: number;

	center: XY;

	wheelZoom: boolean;
	wheelZoomMod: UIEventModifier;
	dragPan: boolean;
	dragPanButton: number;
	dragPanMod: UIEventModifier;

	fill: string|null;
}

export abstract class AbstractCanvasLayer {
	protected constructor(
		public readonly id: string
	) {}

	visible:boolean = true;
	fixed:boolean = false;
	abstract drawTo(dst: CanvasRenderingContext2D): void;
}

export class LayeredCanvas {
	constructor(options?:Partial<LayeredCanvasOptions>) {
		this.options = Object.assign({
			viewportWidth: 300,
			viewportHeight: 200,

			zoom: 0,
			minZoom: -20,
			maxZoom: +20,
			center: {x:0,y:0},

			wheelZoom: true,
			wheelZoomMod: null,
			dragPan: true,
			dragPanButton: 2, // right button
			dragPanMod: null,

			fill: null,
		}, options);
		this.zoomFactor = this.calcZoomFactor();

		this.c2d = createCanvas(this.options.viewportWidth, this.options.viewportHeight);
		this.updateViewport(this.options.viewportWidth, this.options.viewportHeight);
		this.setupEvents();
	}

	readonly c2d:CanvasRenderingContext2D;

	private options: LayeredCanvasOptions;
	get viewportWidth():number { return this.options.viewportWidth }
	get viewportHeight():number { return this.options.viewportHeight }
	get zoom():number { return this.options.zoom }
	private zoomFactor: number;
	get minZoom():number { return this.options.minZoom }
	get maxZoom():number { return this.options.maxZoom }
	get centerX():number { return this.options.center.x }
	get centerY():number { return this.options.center.y }

	private readonly layers: AbstractCanvasLayer[] = [];
	phase = 0;
	animationSpeed = 1;
	fill: string|undefined = undefined;

	beforeRender: ((l:this) => void) | null = null;
	afterRender: ((l:this) => void) | null = null;

	get element():HTMLCanvasElement {
		return this.c2d.canvas;
	}

	private zoomConstant = 9 / 8;

	private calcZoomFactor():number {
		return this.zoomConstant**this.zoom;
	}
	private calcZoomFromFactor(zf:number):number {
		return logarithm(this.zoomConstant, zf);
	}
	addLayer(layer: AbstractCanvasLayer, below?:string): void {
		let pos = below ? this.layers.findIndex(layer=>layer.id === below) : -1;
		if (pos === -1) {
			this.layers.push(layer);
		} else {
			this.layers.splice(pos, 0, layer);
		}
	}
	addLayerAbove(layer: AbstractCanvasLayer, refLayerId:string):void {
		let pos = this.layers.findIndex(layer=>layer.id === refLayerId);
		if (pos === -1) {
			this.layers.unshift(layer);
		} else {
			this.layers.splice(pos+1, 0, layer);
		}
	}

	setViewport(width:number, height:number): boolean {
		if (this.options.viewportWidth === width && this.options.viewportHeight === height) return false;
		this.options.viewportWidth = width;
		this.options.viewportHeight = height;
		this.updateViewport(width, height);
		return true;
	}

	private updateViewport(width: number, height: number) {
		this.c2d.canvas.style.width = `${width}px`;
		this.c2d.canvas.style.height = `${height}px`;
		this.c2d.canvas.width = width * devicePixelRatio;
		this.c2d.canvas.height = height * devicePixelRatio;
	}

	stretchToParentSize(): boolean {
		if (!document.contains(this.c2d.canvas)) return false;
		let parent = this.c2d.canvas.parentElement;
		if (!parent) {
			logger.warn("stretchToParentSize() with no parent")
			return false;
		}
		let {width,height} = getComputedBoxes(parent).content;
		return this.setViewport(width, height);
	}

	setZoom(zoom:number): void {
		this.options.zoom = coerce(zoom, this.minZoom, this.maxZoom);
		this.zoomFactor = this.calcZoomFactor();
	}
	setZoomFactor(zf:number):void {
		this.setZoom(this.calcZoomFromFactor(zf));
	}
	modZoom(delta:number): void {
		this.setZoom(this.zoom + delta);
	}
	setCenter(center:XY): void {
		this.options.center = {x:center.x, y:center.y};
	}
	scrollBy(dx:number, dy: number):void {
		this.options.center.x += dx/this.zoomFactor;
		this.options.center.y += dy/this.zoomFactor;
	}
	visibleRect():XYRect {
		return XYRect.fromCenter(
			this.options.center,
			this.viewportWidth / this.zoomFactor,
			this.viewportHeight / this.zoomFactor
		)
	}
	isPointVisible(xy:XY):boolean {
		return XYRect.includess(this.visibleRect(), xy);
	}
	isRectVisible(rect:XYRect):boolean {
		let vr = this.visibleRect();
		return XYRect.includess(vr, XYRect.topLeft(rect)) &&
			XYRect.includess(vr, XYRect.bottomRight(rect));
	}
	fitToShow(rect:XYRect, canZoomOut:boolean=true, canZoomIn:boolean=true):void {
		let scaleX = this.viewportWidth / XYRect.width(rect);
		let scaleY = this.viewportHeight / XYRect.height(rect);
		let zf = Math.min(scaleX, scaleY);
		if (zf < this.zoomFactor && canZoomOut ||
			zf > this.zoomFactor && canZoomIn) {
			this.setZoomFactor(zf);
		}
		this.setCenter(XYRect.center(rect));
	}
	zoomOutToShow(rect:XYRect, padding:number = 0):void {
		if (padding) rect = XYRect.expand(rect, padding);
		if (this.isRectVisible(rect)) return;
		this.fitToShow(rect, true, false);
	}

	render() {
		this.phase = this.animationSpeed * milliTime() / 1000;
		this.beforeRender?.(this);

		const c2d = this.c2d;
		c2d.imageSmoothingEnabled = false;
		c2d.save();
		c2d.scale(devicePixelRatio, devicePixelRatio)
		if (this.fill && this.fill !== "none") {
			c2d.fillStyle = this.fill;
			c2d.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
		}
		let fixedTransform = c2d.getTransform();
		c2d.translate(this.viewportWidth/2, this.viewportHeight/2);
		c2d.scale(this.zoomFactor, this.zoomFactor);
		c2d.translate(-this.centerX, -this.centerY);
		let mainTransform = c2d.getTransform();
		for (let layer of this.layers) {
			if (!layer.visible) continue;
			if (layer.fixed) {
				c2d.setTransform(fixedTransform);
			}
			layer.drawTo(c2d);
			if (layer.fixed) {
				c2d.setTransform(mainTransform);
			}
		}

		this.afterRender?.(this);
		c2d.restore();
	}
	private setupEvents() {
		if (this.options.wheelZoom) {
			this.element.addEventListener("wheel", (e)=>this.handleWheelEvent(e), { passive: false });
		}
		if (this.options.dragPan) {
			this.element.addEventListener("mousedown", (e)=>this.handlePan(e, "down"));
			this.element.addEventListener("mouseleave", (e)=>this.handlePan(e, "leave"));
			this.element.addEventListener("mouseup", (e)=>this.handlePan(e, "up"));
			this.element.addEventListener("mousemove", (e)=>this.handlePan(e, "move"));
			this.element.addEventListener("contextmenu",
				(e)=> {if (this.wasDrag) e.preventDefault();}
			);
			// TODO process touch events, too
		}
		this.element.addEventListener("click", (e)=>this.handleClick(e));
	}
	private mouseX = 0;
	private mouseY = 0;
	private mouseDown = false;
	private wasDrag = false;
	private handleClick(e:MouseEvent) {
		if (this.wasDrag) {
			e.preventDefault();
			return;
		}
	}
	private handlePan(e:MouseEvent, type:"up"|"down"|"leave"|"move") {
		if (type !== "move" && e.button !== this.options.dragPanButton) return;
		switch (type) {
			case "up":
			case "leave":
				if (this.mouseDown) {
					e.preventDefault();
					this.panStop();
				}
				break;
			case "down":
				this.wasDrag = false;
				e.preventDefault();
				this.panStart(e.offsetX, e.offsetY);
				break;
			case "move":
				if (this.mouseDown) {
					e.preventDefault();
					this.wasDrag = true;
					this.panMove(e.offsetX, e.offsetY);
				}
				break;
		}
	}

	private panMove(x: number, y: number) {
		let dx = this.mouseX - x;
		let dy = this.mouseY - y;
		this.scrollBy(dx, dy);
		this.mouseX = x;
		this.mouseY = y;
	}

	private panStop() {
		this.mouseDown = false;
	}

	private panStart(x: number, y: number) {
		this.mouseDown = true;
		this.mouseX = x;
		this.mouseY = y;
	}

	private handleWheelEvent(e:WheelEvent) {
		if (!eventHasMod(this.options.wheelZoomMod, e)) return;
		e.preventDefault();
		this.modZoom(e.deltaY < 0 ? +1 : -1);
	}
}

const logger = LogManager.loggerFor("engine.ui.utils.LayeredCanvas")
