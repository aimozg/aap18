export type GridPos = { x: number, y: number }

export class Direction {
	private constructor(
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

	static NORTHWEST = new Direction("northwest", -1, -1)
	static NORTH = new Direction("north", 0, -1)
	static NORTHEAST = new Direction("northeast", +1, -1)
	static WEST = new Direction("west", -1, 0)
	static CENTER = new Direction("center", 0, 0)
	static EAST = new Direction("east", +1, 0)
	static SOUTHWEST = new Direction("southwest", -1, +1)
	static SOUTH = new Direction("south", 0, +1)
	static SOUTHEAST = new Direction("southeast", +1, +1)

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