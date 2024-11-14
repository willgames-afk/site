
export class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	add(a,y) {
		if (a instanceof Vec) {
			return new Vec(this.x + a.x, this.y + a.y);
		}
		return new Vec(a + this.x, y + this.y);
	}
	sub(a,y) {
		if (a instanceof Vec) {
			return new Vec(this.x - a.x, this.y - a.y);
		}
		return new Vec(this.x - a, this.y - y);
	}
	scale(v) {
		return new Vec(this.x * v, this.y * v);
	}
	len() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	lenSquared() {
		return this.x * this.x + this.y * this.y
	}
	normalize() {
		return this.scale(this.len()); //TODO: fast inverse square root makes this faster
	}
}