export function isPowerOf2(v) {
	return (v & (v-1)) == 0;
}
export class Point {
	constructor (x,y,z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	add(p1) {
		if (arguments.length === 3) {
			p1 = new Point(arguments[0],arguments[1],arguments[2])
		}
		return new Point(
			this.x + p1.x,
			this.y + p1.y,
			this.z + p1.z
		)
	}
	static add(p1,p2) {
		return new Point(
			p1.x + p2.x,
			p1.y + p2.y,
			p1.z + p2.z
		)
	}
}