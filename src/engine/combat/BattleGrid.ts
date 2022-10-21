/*
 * Created by aimozg on 20.10.2022.
 */

import {Creature} from "../objects/Creature";
import {RGBColor} from "../objects/Color";
import * as tinycolor from "tinycolor2";
import {GlyphData, GlyphSource} from "../ui/components/GlyphCanvas";
import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {Random} from "../math/Random";

export type GridPos = {x:number,y:number}
export abstract class GridObject {
	protected constructor(public x:number, public y:number) {
		this.glyph = {ch:'?',fg:tinycolor("#ff00ff")};
	}

	public update():void{}
	public grid:BattleGrid|null = null;
	public glyph:GlyphData;
	public get pos():GridPos { return {x:this.x, y:this.y} }
}

export class GOCreature extends GridObject{
	constructor(x: number, y: number, public readonly creature: Creature) {
		super(x, y);
		this.update();
	}
	update() {
		// TODO character glyph
		if (this.creature instanceof PlayerCharacter) this.glyph = {
			ch: '@',
			fg: tinycolor("#77cc00")
		}; else this.glyph = {
			ch: this.creature.name[0],
			fg: tinycolor("#0077cc")
		}
	}
}
export interface TileType extends GlyphData {
	id:string;
	name:string;
	ch: string;
	fg: RGBColor;
	bg?: RGBColor;
	walkable:boolean;
	solid:boolean;
}

export namespace TileType {
	export const FLOOR:TileType = {
		id: ".",
		name: "floor",
		ch: ".",
		fg: tinycolor("#cccccc"),
		walkable: true,
		solid: false
	}
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
		let cd = this.data(x,y);
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
	public data(x:number, y:number):GridCellData {
		return this._data[this.index(x,y)];
	}
	public cell(x:number, y:number):GridCell {
		return {grid: this, x, y, data: this.data(x, y)};
	}
	public tile(x:number, y:number):TileType {
		return this.data(x,y).tile;
	}
	public object(x:number, y:number):GridObject[] {
		return this.data(x,y).objects??[];
	}
	public visible(x:number, y:number):boolean {
		return this.data(x,y).visible;
	}
	public cdIsEmpty(cd:GridCellData):boolean {
		return cd.objects.length === 0 && cd.tile.walkable && !cd.tile.solid;
	}
	public isEmpty(x:number, y:number):boolean {
		let cd = this.data(x, y);
		return this.cdIsEmpty(cd)
	}
	public randomEmptyCell(rng:Random):[number,number]|null {
		// 1. Just pick random pos and check if it's empty
		// 2. If none found (too dense), assembled list of empty indices and pick from there

		let n = (this.width+this.height)*2;
		while (n-->0) {
			let x = rng.nextInt(this.width);
			let y = rng.nextInt(this.height);
			if (this.isEmpty(x,y)) {
				return [x,y]
			}
		}
		let emptyCells:number[] = [];
		for (let i = 0; i< this.size; i++) {
			if (this.cdIsEmpty(this._data[i])) emptyCells.push(i)
		}
		if (emptyCells.length === 0) return null;
		let idx = rng.pick(emptyCells);
		return [this.i2x(idx), this.i2y(idx)];
	}
	public addObject(object:GridObject, newPos:[number,number]|null = null) {
		if (object.grid !== null)  throw new Error(`Invalid add(${object}), already placed`)
		if (newPos) {
			object.x = newPos[0];
			object.y = newPos[1];
		}
		let objects = this.data(object.x, object.y).objects;
		if (objects.includes(object)) throw new Error(`Duplicate add(${object})`)
		object.grid = this;
		objects.push(object)
	}
	public removeObject(object:GridObject) {
		if (object.grid !== this) throw new Error(`Invalid remove(${object}), not placed`)
		let objects = this.data(object.x, object.y).objects;
		let i = objects.indexOf(object);
		if (i === -1) throw new Error(`Cannot remove ${object}, not in cell`)
		objects.splice(i, 1);
		object.grid = this;
	}
	public setPos(object:GridObject, newX:number, newY:number) {
		this.removeObject(object);
		object.x = newX;
		object.y = newY;
		this.addObject(object);
	}

	distance(go1: GridObject|GridCell|GridPos, go2: GridObject|GridCell|GridPos): number {
		let gp1:GridPos = (go1 instanceof GridObject) ? go1.pos : go1;
		let gp2:GridPos = (go2 instanceof GridObject) ? go2.pos : go2;
		let dx = Math.abs(gp1.x - gp2.x);
		let dy = Math.abs(gp2.y - gp2.y);
		return Math.max(dx,dy) + Math.min(dx,dy)/2; // "Angband metric"
	}
	adjacent(go1: GridObject|GridCell|GridPos, go2: GridObject|GridCell|GridPos, allowDiagonal:boolean=true) {
		let d = this.distance(go1, go2);
		return d < (allowDiagonal ? 1.5 : 1.0);
	}
}
