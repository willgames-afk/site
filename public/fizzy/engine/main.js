import { Assets, Loader } from "./loader.js"
import { Sprite } from "./sprite.js";
import { load, save, remove } from "./save.js"

export class Game {

	get width() {return this.canvas.width}
	set width(v) {this.canvas.width = v}
	get height() {return this.canvas.height}
	set height(v) {this.canvas.height = v}

	constructor(o,) {
		this.init = o.init;
		this.loop = o.loop;
		this.start = o.start;

		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");

		this.audioContext = new AudioContext();

		this.assets = new Assets();
		this.loader = new Loader(this.assets, this.audioContext, this.startloop.bind(this));
		this.loader.load = this.loader.load.bind(this.loader);

		this.prevtime = null;
		this.gameObjs = {};
		this.gameState = {};

		this.stop = false;
		this.make =this.make.bind(this);


		this.O = {};

		this.O = {
			load: this.loader.load,
			width: this.width,
			height: this.height,
			pixelartmode: false,
			scale: 1,
		}
		console.log(this.O)

		this.init(this.O);
		if (this.loader.toLoad > 0) {
			this.loader.loadAll();
		} else {
			this.startloop();
		}
	}
	startloop() {
		console.log(this.O)
		console.log("Everything so far: ", this)
		this.width = this.O.width * this.O.scale;
		this.height = this.O.height * this.O.scale;
		this.scale = this.O.scale;
		this.ctx.imageSmoothingEnabled = !this.O.pixelartmode;
		this.ctx.scale(this.scale,this.scale)

		this.O = {
			draw: this.draw,
			make: this.make,
			stop: () => {
				this.stop = true;
			},
			state: this.gameState,
			save: save,
			load: load,
			removeSave: remove
		}
		this.start(this.O)
		this.gameState = this.O.state;


		this.prevTime = Date.now() - 16.66;
		requestAnimationFrame(this.outerLoop.bind(this));
	}
	outerLoop(ct) {
		var dt = (ct - this.prevTime) * 16.66;
		this.O = {
			draw: this.draw.bind(this),
			make: this.make,
			stop: () => {
				this.stop = true;
			},
			state: this.gameState,
			save: save,
			load: load,
			removeSave: remove,
			width: this.width,
			height: this.height,
			get color() {return this.ctx.fillStyle},
			set color(v) {this.ctx.fillStyle = v}
		}
		this.loop(this.O);
		this.gameState = this.O.state;
		if (!this.stop) {
			requestAnimationFrame(this.outerLoop.bind(this));
		}
	}

	draw(id, ...params) {

		if (this.gameObjs[id]) {
			switch (this.gameObjs[id].type) {
				case "sprite":
					this.drawSprite(id, ...params);
					break;
				case "tilemap":
					this.drawTilemap(id, ...params);
					break;
			}
		} else {
			this.ctx[id](...params);
		}
	}
	drawSprite(id, scale = 1) {
		var s = this.gameObjs[id];
		//console.log(s);
		var sx = s.frames[s.frame].x;
		var sy = s.frames[s.frame].y
		this.ctx.drawImage(s.img, sx, sy, s.w, s.h, s.x, s.y, s.w * scale * this.scale, s.h * scale * this.scale);
	}
	drawTilemap(id, scale) {
		var t = this.gameObjs[id];

		var x1 = Math.floor(-t.x / t.tiles.width) * t.tiles.width;
		var x2 = Math.ceil((-t.x + this.width) / t.tiles.width) * t.tiles.width;

		var y1 = Math.floor(-t.y / t.tiles.height) * t.tiles.height;
		var y2 = Math.ceil((-t.y + this.height) / t.tiles.height) * t.tiles.height;

		for (var y = y1; y < y2 && y < t.length; y++) {
			for (var x = x1; x < x2 && x < t[y].length; x++) {
				t.drawTile(this.ctx, t[y][x], x * t.tiles.width, y * t.tiles.height);
			}
		}
	}

	make(id, tex, ...params) {
		//console.log(this.assets[tex]);
		var texture = this.assets[tex]
		if (!texture) {
			console.error("Invalid Texture!")
			return
		}
		this.gameObjs[id] = new Sprite(texture.img, texture.data, ...params);
	}
}