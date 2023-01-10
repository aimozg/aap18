export type GridPos = { x: number, y: number }

export function sumpos(a:GridPos, b:GridPos):GridPos {
	return {x:a.x+b.x,y:a.y+b.y};
}
export function mulpos(a:GridPos, scale:number):GridPos {
	return {x:a.x*scale,y:a.y*scale};
}

export class Direction {
	private constructor(
		/** Index in Direction.All list */
		readonly id:number,
		readonly name:string,
		readonly dx:number,
		readonly dy:number
	) {}

	add(pos:GridPos):GridPos {
		return {x: pos.x + this.dx, y: pos.y + this.dy}
	}
	static to(from:GridPos, to:GridPos):Direction {
		return Direction.get(to.x-from.x,to.y-from.y)
	}
	static get(dx:number, dy:number):Direction {
		if (dy < 0) {
			if (dx < 0) return Direction.NORTHWEST
			if (dx > 0) return Direction.NORTHEAST
			return Direction.NORTH
		}
		if (dy > 0) {
			if (dx < 0) return Direction.SOUTHWEST
			if (dx > 0) return Direction.SOUTHEAST
			return Direction.SOUTH
		}
		if (dx < 0) return Direction.WEST
		if (dx > 0) return Direction.EAST
		return Direction.CENTER
	}

	static NORTHWEST = new Direction(0,"northwest", -1, -1)
	static NORTH = new Direction(1,"north", 0, -1)
	static NORTHEAST = new Direction(2,"northeast", +1, -1)
	static WEST = new Direction(3,"west", -1, 0)
	static CENTER = new Direction(4,"center", 0, 0)
	static EAST = new Direction(5,"east", +1, 0)
	static SOUTHWEST = new Direction(6,"southwest", -1, +1)
	static SOUTH = new Direction(7,"south", 0, +1)
	static SOUTHEAST = new Direction(8,"southeast", +1, +1)

	static All = Object.freeze([
		Direction.NORTHWEST,Direction.NORTH,Direction.NORTHEAST,
		Direction.WEST,Direction.CENTER,Direction.EAST,
		Direction.SOUTHWEST,Direction.SOUTH,Direction.SOUTHEAST,
	]);
	static Steps = Object.freeze([
		Direction.NORTHWEST,Direction.NORTH,Direction.NORTHEAST,
		Direction.WEST,/*Direction.CENTER,*/Direction.EAST,
		Direction.SOUTHWEST,Direction.SOUTH,Direction.SOUTHEAST,
	]);
}
