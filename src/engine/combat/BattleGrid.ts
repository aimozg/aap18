/*
 * Created by aimozg on 20.10.2022.
 */

import {Creature} from "../objects/Creature";
import {RGBColor} from "../objects/Color";
import * as tinycolor from "tinycolor2";
import {CanvasOverlay, GlyphData, GlyphSource, StyledTextSpan} from "../ui/components/GlyphCanvas";
import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {Random} from "../math/Random";
import {GridPos, sumpos} from "../utils/gridutils";
import {IResource} from "../IResource";
import Symbols from "../symbols";
import {ApToAct} from "./CombatController";
import {lint} from "../math/utils";
import {LogManager} from "../logging/LogManager";
import {Deferred} from "../utils/Deferred";
import {CoreConditions} from "../objects/creature/CoreConditions";

export abstract class GridObject {
	get glyph(): GlyphData {
		return {ch:'?',fg:tinycolor("#ff00ff")};
	}
	protected constructor(public x:number, public y:number) {
	}

	public grid:BattleGrid|null = null;
	public get pos():GridPos { return {x:this.x, y:this.y} }
}

export class GOCreature extends GridObject{
	constructor(x: number, y: number, public readonly creature: Creature) {
		super(x, y);
	}

	get glyph(): GlyphData {
		// TODO character glyph
		let glyph: GlyphData;
		if (this.creature instanceof PlayerCharacter) {
			glyph = {
				ch: '@',
				fg: tinycolor("#77cc00")
			};
		} else {
			glyph = {
				ch: this.creature.name[0],
				fg: tinycolor("#0077cc")
			}
		}
		if (this.creature.hasCondition(CoreConditions.Stealth)) {
			(glyph.fg as RGBColor).setAlpha(0.5);
		}
		if (this.creature.ap >= ApToAct) {
			glyph.fg = {
				fx: "brighten",
				speed: "fblink",
				color: (glyph.fg as RGBColor)
			}
		}
		if (!this.creature.isAlive) {
			glyph.bg = tinycolor("#733")
		}
		return glyph;
	}

}
export class TileType implements GlyphData, IResource {
	constructor(
		public resId: string,
		public name: string,
		public ch: string,
		public fg: RGBColor,
		public bg: RGBColor|null,
		public walkable: boolean,
		public solid: boolean
	) {
	}
	get resType() { return Symbols.ResTypeTile }
}

export namespace TileType {
	export const FLOOR:TileType = new TileType(
		"/floor",
		"floor",
		".",
		tinycolor("#555555"),
		null,
		true,
		false);
}
export interface GridCellData {
	visible: boolean;
	tile: TileType;
	objects: GridObject[];
}
export interface GridCell {
	grid: BattleGrid;
	x: number;
	y: number;
	data: GridCellData;
}

interface MovingGlyph {
	go:GridObject;
	pos:GridPos;
	from:GridPos;
	to:GridPos;
	phase:number;
	durationMs:number;
	steps:number;
	promise:Deferred<void>;
}

export type FloatingTextStyle = "bubbleup"|"jitter"|"stay";
interface FloatingText {
	pos: GridPos;
	from: GridPos;
	style: FloatingTextStyle;
	time: number;
	durationMs: number;
	text: StyledTextSpan[];
	promise: Deferred<void>;
}
/** style => (time => {dx,dy}) */
const FloatingTextFunctions:Record<FloatingTextStyle,(timeSec:number)=>GridPos> = {
	bubbleup: (time) => ({
		x: 0.5,
		// hyperbolic plot that gives y=0.25 at time=0 and y=-0.25 at time=0.5
		y: 0.5/(time+0.5)-0.75
	}),
	jitter: (time) => ({
		// 100Hz jitter, starting at x=0.5
		x: 0.5+0.05*Math.sin(100*time),
		y: 0,
	}),
	stay: ()=>({x:0,y:0})
}

export interface WrappedAnimationPromise {
	finished:Promise<void>;
}

const logger = LogManager.loggerFor("engine.combat.BattleGrid")
export class BattleGrid implements GlyphSource {
	constructor(
		public readonly width:number,
		public readonly height:number,
		defaultTile: TileType = TileType.FLOOR
	) {
		this._data = [];
		for (let i = 0; i < width*height; i++) {
			this._data.push({visible: true, tile: defaultTile, objects: []});
		}
	}
	public _data:GridCellData[];
	public readonly size:number = this.width*this.height;
	private movingGlyphs:Map<GridObject,MovingGlyph> = new Map();
	private floatingTexts:FloatingText[] = [];
	animateFloatingText(pos:GridPos, style:FloatingTextStyle, durationMs:number, ...text:StyledTextSpan[]):WrappedAnimationPromise {
		let ft:FloatingText = {
			from: pos,
			pos: sumpos(pos, FloatingTextFunctions[style](0)),
			time: 0,
			durationMs,
			text,
			promise: new Deferred<void>(),
			style
		}
		logger.debug("animateFloatingText: {},{} {} {}", ft.pos.x,ft.pos.y, style, text[0]?.text);
		this.floatingTexts.push(ft);
		return {finished:ft.promise};
	}
	animateMovement(go:GridObject, from:GridPos, to:GridPos, durationMs:number, steps:number=4):WrappedAnimationPromise {
		let mg:MovingGlyph = {
			go,
			from,
			to,
			pos: {x:from.x,y:from.y},
			phase: 0,
			durationMs,
			steps,
			promise:new Deferred<void>()
		}
		logger.debug("animateMovement {}: {},{} -> {},{}",go,from.x,from.y,to.x,to.y);
		this.movingGlyphs.set(go, mg);
		return {finished:mg.promise};
	}
	glyphAt(x: number, y: number): GlyphData | null {
		if (!this.hasxy(x,y)) return null;
		let cd = this.data({x, y});
		if (!cd.visible) return null;
		if (cd.objects.length === 0) return cd.tile;
		let gd: GlyphData = {ch: cd.tile.ch, fg: cd.tile.fg, bg: cd.tile.bg};
		for (let o of cd.objects) {
			if (this.movingGlyphs.has(o)) continue;
			Object.assign(gd, o.glyph);
		}
		return gd;
	}
	overlays(): CanvasOverlay[] {
		let overlays:CanvasOverlay[] = [];
		this.movingGlyphs.forEach(mg=>{
			overlays.push({
				type: "glyph",
				row: mg.pos.y,
				col: mg.pos.x,
				glyph: mg.go.glyph
			});
		});
		overlays.push(...this.floatingTexts.map<CanvasOverlay>(ft=>({
			type: "text",
			row: ft.pos.y,
			col: ft.pos.x,
			text: ft.text
		})))
		return overlays;
	}
	animationFrame(dt:number) {
		for (let mg of this.movingGlyphs.values()) {
			let phase = (mg.phase += dt/mg.durationMs);
			if (phase >= 1.0) {
				this.movingGlyphs.delete(mg.go);
				logger.debug("animation finished for {}", mg.go);
				mg.promise.resolve();
				continue;
			}
			if (mg.steps) {
				phase = Math.floor(phase*mg.steps)/mg.steps;
			}
			mg.pos = {
				x: lint(phase, mg.from.x, mg.to.x),
				y: lint(phase, mg.from.y, mg.to.y),
			}
		}
		for (let ft of this.floatingTexts) {
			ft.time += dt;
			if (ft.time >= ft.durationMs) {
				this.floatingTexts.remove(ft);
				logger.debug("animation finished for {}",ft.text[0]?.text);
				ft.promise.resolve();
				continue;
			}
			ft.pos = sumpos(ft.from, FloatingTextFunctions[ft.style](ft.time/1000));
		}
	}
	public index(x:number, y:number):number {
		return y*this.width + x;
	}
	public hasxy(x:number, y:number):boolean {
		return x >= 0 && x < this.width && (x|0) === x &&
			y >= 0 && y < this.height && (y|0) === y;
	}
	public i2x(index:number):number {
		return index%this.width;
	}
	public i2y(index:number):number {
		return (index/this.width)|0;
	}
	public data(xy:GridPos):GridCellData {
		return this._data[this.index(xy.x, xy.y)]
	}
	public cell(xy:GridPos):GridCell {
		return {grid: this, x:xy.x, y:xy.y, data: this.data(xy)};
	}
	public tile(xy:GridPos):TileType {
		return this.data(xy).tile;
	}
	public object(xy:GridPos):GridObject[] {
		return this.data(xy).objects??[];
	}
	public visible(xy:GridPos):boolean {
		return this.data(xy).visible;
	}
	public cdIsEmpty(cd:GridCellData):boolean {
		return cd.objects.length === 0 && cd.tile.walkable && !cd.tile.solid;
	}
	public isempty(xy:GridPos):boolean {
		let cd = this.data(xy);
		return this.cdIsEmpty(cd)
	}
	public randomEmptyCell(rng:Random):GridPos|null {
		// 1. Just pick random pos and check if it's empty
		// 2. If none found (too dense), assembled list of empty indices and pick from there

		let n = (this.width+this.height)*2;
		let pos:GridPos = {x:0,y:0}
		while (n-->0) {
			pos.x = rng.nextInt(this.width);
			pos.y = rng.nextInt(this.height);
			if (this.isempty(pos)) {
				return pos
			}
		}
		let emptyCells:number[] = [];
		for (let i = 0; i< this.size; i++) {
			if (this.cdIsEmpty(this._data[i])) emptyCells.push(i)
		}
		if (emptyCells.length === 0) return null;
		let idx = rng.pick(emptyCells);
		return {x:this.i2x(idx), y:this.i2y(idx)};
	}
	public placeCreature(creature:Creature, xy:GridPos):GOCreature {
		if (creature.gobj !== null) throw new Error(`Creature ${creature} already placed`);
		let gobj = creature.gobj = new GOCreature(xy.x, xy.y, creature);
		this.addObject(gobj);
		return gobj;
	}
	public addObject(object:GridObject, newXY?:GridPos) {
		if (object.grid !== null)  throw new Error(`Invalid add(${object}), already placed`)
		if (newXY) {
			object.x = newXY.x;
			object.y = newXY.y;
		}
		let objects = this.data(object).objects;
		if (objects.includes(object)) throw new Error(`Duplicate add(${object})`)
		object.grid = this;
		objects.push(object)
	}
	public removeObject(object:GridObject) {
		if (object.grid !== this) throw new Error(`Invalid remove(${object}), not placed`)
		let objects = this.data(object).objects;
		let i = objects.indexOf(object);
		if (i === -1) throw new Error(`Cannot remove ${object}, not in cell`)
		objects.splice(i, 1);
		object.grid = null;
	}
	public setPos(object:GridObject, xy:GridPos) {
		this.removeObject(object);
		object.x = xy.x;
		object.y = xy.y;
		this.addObject(object);
	}

	distance(go1: GridObject|GridCell|GridPos, go2: GridObject|GridCell|GridPos): number {
		let gp1:GridPos = (go1 instanceof GridObject) ? go1.pos : go1;
		let gp2:GridPos = (go2 instanceof GridObject) ? go2.pos : go2;
		let dx = Math.abs(gp1.x - gp2.x);
		let dy = Math.abs(gp1.y - gp2.y);
		return Math.max(dx,dy) + Math.min(dx,dy)/2; // "Angband metric"
	}
	adjacent(go1: GridObject|GridCell|GridPos, go2: GridObject|GridCell|GridPos, allowDiagonal:boolean=true) {
		let d = this.distance(go1, go2);
		return d <= (allowDiagonal ? 1.5 : 1.0);
	}
}
