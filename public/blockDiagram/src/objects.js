export class Block {
	constructor(x,y,w,h,n,c,type,i) {
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.width = Math.round(w);
		this.height = Math.round(h);
		this.name = n;
		this.connectionPoints = c;
		this.internal = i;
		this.type = type;
	}
}
export class Connection {
	constructor(points) {
		this.start = points.shift();
		this.end = points.pop();
		this.midpoints = points;
	}
}