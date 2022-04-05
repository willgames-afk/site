import { GameObj } from "./gameObjs.js"
export class Sprite extends GameObj {
	constructor(img, data, x, y, xv, yv, frame=0) {
		super("sprite")
		this.img = img;

		this.w = data.shift();
		this.h = data.shift();

		this.frames = [];
		for (var i = 0; i < data.length; i += 2) {
			this.frames.push({ x: data[i], y: data[i + 1] });
		}

		console.log(`Sprite W:${this.w},H:${this.h},Frame1 at:(${this.frames[0].x},${this.frames[0].x})`)

		this.x = x;
		this.y = y;
		this.xv = xv;
		this.yv = yv;
		this.frame = frame;
	}
	on(event, b, c) {
		var handler;
		var group;
		if (typeof c == "undefined") {
			handler = b;
		} else {
			handler = c;
			group = b;
		}


		switch (event) {
			case "mouseclick":
				//Register mouse click listener!
				break;
			case "mousedown":
				break;
			case "mouseup":
				break;
			case "collide":
				//Register collision listener with group
				break;
		}
	}
}