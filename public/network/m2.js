export class Vec2 {
	constructor(x, y) {
		if (Array.isArray(x)) {
			this.x = x[0];
			this.y = x[1];
		} else {
			this.x = x;
			this.y = y;
		}
	}
	static fromAngleMag(angle,magnitude){return new Vec2(magnitude*cos(angle),magnitude*sin(angle))}
	static lerp(v1,v2,t) {return v1.scale(1-t).add(v2.scale(t))}

	//Functions that return another Vec2
	        add(v2){return new Vec2(this.x + v2.x, this.y + v2.y)}
	        sub(v2){return new Vec2(this.x - v2.x, this.y - v2.y)}
	       scale(s){return new Vec2(this.x * s, this.y*s)}
	       normal(){return new Vec2(-this.y, this.x)}
	    normalize(){return this.scale(1 / this.len())}
	rotateBy(angle){return Mat2.rotation(angle).dotv(this)}
	  transform(m2){return m2.dotv(this)}
	 complexMul(v2){return new Vec2(this.x * v2.x - this.y * v2.y,this.x * v2.y + this.y * v2.x)}
	projectOnto(v1){return v1.scale(this.dot(v1)/(v1.dot(v1)))}

	//Functions that don't return a Vec2
	   cross(v2){return this.x*v2.y - this.y * v2.x} //2D CROSS PRODUCT IS WEIRD!
	     dot(v2){return this.x*v2.x + this.y*v2.y}
	       len(){return Math.sqrt(this.x * this.x + this.y * this.y)}
		   //Note: to get len squared instead of true len (cheaper), just use v.dot(v)
	angleFromX(){return Math.atan2(this.y, this.x)}
	   asArray(){return [this.x, this.y]}

	toString(){return `(${this.x},${this.y})`}
}

//Intersect 2 line segments
export function intersect(p, p2, q, q2, extend=false){
	let r = p2.sub(p);
	let s = q2.sub(q);

	var rs = r.cross(s);
	let qp = q.sub(p);
	//TODO: Exact equals comparison on a float is CRINGE
	if (rs == 0) {
		if (qp.cross(r) == 0) {
			//The lines are colinear and are intersecting but return false for now because there is more than one point of intersection
		}
	} else /* rs != 0 */ {
		//Lines are not parallel:
		rs = 1/rs;
		let t = qp.cross(s.scale(rs));
		let u = qp.cross(r.scale(rs));
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			//Lines segments intersect
			return p.add(r.scale(t));
		} else if (extend) {
			// Because they are not parallel, if you extend the lines far enough, they will eventually intersect.
			return p.add(r.scale(t));
		}
	}
	return false;
}

export function testIntersect(){
	let tests = [
		[new Vec2(0,1),new Vec2(1,0),new Vec2(0,0),new Vec2(1,1),new Vec2(0.5,0.5)],
		[new Vec2(0,0),new Vec2(1,0),new Vec2(0,0),new Vec2(0,1),new Vec2(0,0)],
		[new Vec2(0,0),new Vec2(1,1),new Vec2(1,0),new Vec2(2,1),false]
	]
	let permutations = [
		t=>[t[0],t[1],t[2],t[3]],
		t=>[t[1],t[0],t[2],t[3]],
		t=>[t[0],t[1],t[3],t[2]],
		t=>[t[1],t[0],t[3],t[2]]
	]

	var fail = false;
	var result = null;
	var t2 = null;
	for (let test of tests){
	for (let permute of permutations) {
		t2 = permute(test);
		result = intersect(...t2);
		if (result.x != test[4].x || result.y != test[4].y) {
			console.log(`Test intersect(${t2}) returned ${result} instead of ${test[4]}`)
			fail = true;
		}
	}}
	if (!fail) {
		console.log("Intersect works as expected.")
	}
	return !fail;
}

//2x2 matrix
export class Mat2 {
	/*
	Todo: scale
	*/
	constructor(a,b,c,d){
		if (Array.isArray(a)){
			this[0] = a[0];
			this[1] = a[1];
			this[2] = a[2];
			this[3] = a[3];
		} else {
			this[0] = a;
			this[1] = b;
			this[2] = c;
			this[3] = d;
		}
	}

	static ident(){return new Mat2(1,0,0,1)}
	static rotation(angle){return new Mat2(Math.cos(angle),-Math.sin(angle),Math.sin(angle),Math.cos(angle))} //TODO: combine duplicate cos and sin?
	rotate(angle) {return this.dot(Mat2.rotation(angle))}

	static transformation(v2){return new Mat2}

	scale(s) {return new Mat2(this[0] * s, this[1] * s, this[2] * s, this[3] * s)}
	dot(m2) {return new Mat2(
		this[0] * m2[0] + this[1] * m2[2], this[0] * m2[1] + this[1] * m2[3],
		this[2] * m2[0] + this[3] * m2[2], this[2] * m2[1] + this[3] * m2[3]
	)}
	dotv(v2) {return new Vec2(
		this[0]*v2.x + this[1]*v2.y,
		this[2]*v2.x + this[3]*v2.y
	)}
}