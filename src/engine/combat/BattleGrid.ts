/*
 * Created by aimozg on 20.10.2022.
 */

import {Creature} from "../objects/Creature";
import {RGBColor} from "../objects/Color";
import * as tinycolor from "tinycolor2";
import {GlyphData, GlyphSource} from "../ui/components/GlyphCanvas";
import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {Random} from "../math/Random";
import {GridPos} from "../utils/gridutils";
import {IResource} from "../IResource";
import Symbols from "../symbols";
import {ApToAct} from "./CombatController";

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
	glyphAt(x: number, y: number): GlyphData | null {
		if (!this.hasxy(x,y)) return null;
		let cd = this.data({x, y});
		if (!cd.visible) return null;
		if (cd.objects.length === 0) return cd.tile;
		let gd: GlyphData = {ch: cd.tile.ch, fg: cd.tile.fg, bg: cd.tile.bg};
		for (let o of cd.objects) {
			Object.assign(gd, o.glyph);
		}
		return gd;
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
