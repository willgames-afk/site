import { GameObj } from "./gameObjs.js"
export class Tilemap extends GameObj {
	constructor(img, data, x, y) {
		super("tilemap");
		this.img = img;
		this.tiles.width = data.tileset.width;
		this.tiles.height = data.tileset.height;
		this.tiles.cols = Math.floor(this.img.width / this.tiles.width);
		this.data = data.data;
		this.x = x;
		this.y = y;
	}
	drawTile(ctx, number, ...destparams) {
		var sx = (number % this.tiles.cols) * this.tiles.width;
		var sy = Math.floor(number / this.tiles.cols) * this.tiles.height;

		ctx.drawImage(this.img, sx, sy, this.tiles.width, this.tiles.height, ...destparams);
	}
}