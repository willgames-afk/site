//window.onload = function () {
const WIDTH = 100;
const HEIGHT = 75;
const SCALE = 4;


class ParticleGrid {
	constructor(width = 0, height = 0, scale = 1, particles = [{ color: [0, 0, 0, 0] }]) {

		//Standard copying of properties
		this.width = width, this.height = height, this.scale = scale, this.particles = particles;

		//More property declarations
		this.grid = new Array(this.height).fill().map(() => Array(this.width).fill(0)); //Grid containing all particles
		this.gridBuffer = this.grid.valueOf(); //Buffer; changes are written here and applied all at once to prevent errors.
		this.toUpdate = []; //Particles in need of updating

		//Canvas Config
		this.htmlContainer = document.getElementById("mainbox"); //Boring DOM stuff
		this.scaledCanvas = document.createElement("canvas");
		this.scaledCanvas.width = this.width * this.scale //Resizing
		this.scaledCanvas.height = this.height * this.scale
		this.htmlContainer.appendChild(this.scaledCanvas); //More boring dom stuff
		this.scaledCtx = this.scaledCanvas.getContext("2d");

		this.canvas = new OffscreenCanvas(this.width, this.height);

		this.ctx = this.canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = false;
		this.scaledCtx.imageSmoothingEnabled = false;
		this.imgRaw = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height); //Getting image data


		//Function wrapping
		function wrap(gc, sc, func) {
			return function (x, y) {
				return func(gc, sc, x, y);
			}
		}
		for (var particle of this.particles) {
			if (particle.function) {
				particle.function = wrap(this.getCell.bind(this), this.setCell.bind(this), particle.function)
			}
		}

		//Render the inital scene
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				const v = this.grid[y][x];
				this.imgRaw.data[(y * this.width + x) * 4 + 0] = this.particles[v].color[0];
				this.imgRaw.data[(y * this.width + x) * 4 + 1] = this.particles[v].color[1];
				this.imgRaw.data[(y * this.width + x) * 4 + 2] = this.particles[v].color[2];
				this.imgRaw.data[(y * this.width + x) * 4 + 3] = this.particles[v].color[3];
			}
		}
		this.ctx.putImageData(this.imgRaw, 0, 0, 0, 0, this.canvas.width, this.canvas.width);
		this.scaledCtx.drawImage(this.canvas, 0, 0, this.scaledCanvas.width, this.scaledCanvas.height)
	}
	getCell(x, y) {
		//console.log(`cell GET at ${x}, ${y}`)
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			return this.grid[y][x];
		} else {
			return 1;
		}
	}
	setCell(x, y, v, update = false, blit = false) {
		//console.log(`cell SET at (${x}, ${y}) to value ${v}`);

		if (x >= 0 && x < this.width && y >= 0 && y < this.height && this.particles[v]) {

			this.gridBuffer[y][x] = v;

			this.imgRaw.data[(y * this.width + x) * 4 + 0] = this.particles[v].color[0];
			this.imgRaw.data[(y * this.width + x) * 4 + 1] = this.particles[v].color[1];
			this.imgRaw.data[(y * this.width + x) * 4 + 2] = this.particles[v].color[2];
			this.imgRaw.data[(y * this.width + x) * 4 + 3] = this.particles[v].color[3];

			if (blit) {
				this.blit();
			}
			if (update) {
				this.toUpdate.push([x, y]);
			}

			return this.gridBuffer[y][x];
		} else {
			console.error("Invalid setCell!!");
			console.log("x: ", x, "y: ", y, "v: ", v)
			return undefined;
		}
	}
	blit() {
		//console.log("blit!")
		this.grid = this.gridBuffer.valueOf();
		this.ctx.putImageData(this.imgRaw, 0, 0);
		this.scaledCtx.drawImage(this.canvas, 0, 0, this.scaledCanvas.width, this.scaledCanvas.height)
	}
	applyGridBuffer() {
		this.grid = this.gridBuffer.valueOf();
	}
	update() {
		if (this.toUpdate.length > 0) {
			//Remove Duplicates
			this.toUpdate = this.toUpdate.filter((value, index) => {
				return this.toUpdate.indexOf(value) === index;
			})
			var stillNeedsUpdating = []; //Will hold particles that still need to be updated
			while (this.toUpdate.length > 0) {
				const i = this.toUpdate.length - 1;
				const particle = this.particles[
					this.getCell(
						this.toUpdate[i][0],
						this.toUpdate[i][1]
					)
				];
				if (particle.function) {
					const res = particle.function(this.toUpdate[i][0], this.toUpdate[i][1]);
					if (res !== 0) {
						stillNeedsUpdating.push(...res); //Function says particle isn't done; will need more processing later.
					};
				}
				this.toUpdate.pop(); //Particle has been updated, remove it from list and continue!
			}
			this.toUpdate = stillNeedsUpdating.slice(0);
			this.applyGridBuffer();
			this.blit();
		}

	}
	start() {
		this.looper = window.setInterval(this.update.bind(this), 50);
	}
}
var particles = [
	{ color: [100, 100, 100, 255] }, //Air is index 0; render it transparent and don't do anything with it.
	{                        //Sand is index 1; render it tan-ish and make it fall
		function: (getCell, setCell, x, y) => {
			if (getCell(x, y + 1) == 0) {
				setCell(x, y, 0);
				setCell(x, y + 1, 1);
				return [[x, y + 1]]; //update this particle and the particle above where it was next cycle
			}
			return 0; //Static; no longer in need of updates				}
		},
		color: [255, 128, 64, 255]
	}
]

var grid = new ParticleGrid(WIDTH, HEIGHT, SCALE, particles);
grid.setCell(50, 0, 1, true, true);
grid.setCell(50, 1, 1, true, true);
grid.start();
//}