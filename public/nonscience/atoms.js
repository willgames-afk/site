const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;

const htmlContainer = document.getElementById('mainbox');
var canvas = document.createElement("canvas");
canvas.width = 400
canvas.height = 300
htmlContainer.appendChild(canvas);

class Particle {
	constructor(x, y, xVel, yVel, mass) {
		this.x = x, this.y = y, this.xVel = xVel, this.yVel = yVel, this.mass = mass;
		if (!this.xVel) {
			this.xVel = 0;
		}
		if (!this.yVel) {
			this.yVel = 0;
		}
	}
	static exertForceBetween(p1, p2, forceX, forceY) {
		p1.xVel += forceX / p1.mass;
		p1.yVel += forceY / p1.mass;
		p2.xVel -= forceX / p2.mass;
		p2.yVel -= forceY / p2.mass;
	}
	static distance(p1, p2) {
		return Math.hypot(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
	}
}

class Electron extends Particle {
	static RAD = 4;
	static FRICTION = 0.91234;
	constructor(x, y, xVel, yVel) {
		super(x, y, xVel, yVel);
		console.log(this)
	}
}

class Atom extends Particle {
	static types = {
		"P": {
			size: 20, //Radius in pixels
			massMultiplier: 1, //Mass is calculated based on size and then multiplied by this number; bigger means denser.
			color: "#aaa", //Color in hex
		}
	}
	constructor(type, x, y, xVel, yVel) {
		super(x, y, xVel, yVel, Atom.types[type].size * Atom.types[type].size * Math.PI * Atom.types[type].massMultiplier);
		this.type = type;
		this.size = Atom.types[type].size;
		this.massMultiplier = Atom.types[type].massMultiplier;
		this.color = Atom.types[type].color;
		this.electrons = new Array(2);
		const rad = this.size + 10;
		this.electrons[0] = new Electron(rad * Math.sin(0.2) + this.x, rad * Math.cos(0.2) + this.y)
		this.electrons[1] = new Electron(rad * Math.sin(-0.2) + this.x, rad * Math.cos(-0.2) + this.y)
		this.electrons[2] = new Electron(rad * Math.sin(0.2 + HALF_PI) + this.x, rad * Math.cos(0.2 + HALF_PI) + this.y)
		this.electrons[3] = new Electron(rad * Math.sin(-0.2 + HALF_PI) + this.x, rad * Math.cos(-0.2 + HALF_PI) + this.y)
		this.electrons[4] = new Electron(rad * Math.sin(0.2 - HALF_PI) + this.x, rad * Math.cos(0.2 - HALF_PI) + this.y)
		this.electrons[5] = new Electron(rad * Math.sin(-0.2 - HALF_PI) + this.x, rad * Math.cos(-0.2 - HALF_PI) + this.y)
		this.electrons[6] = new Electron(rad * Math.sin(0.2 + Math.PI) + this.x, rad * Math.cos(0.2 + Math.PI) + this.y)
		this.electrons[7] = new Electron(rad * Math.sin(-0.2 + Math.PI) + this.x, rad * Math.cos(-0.2 + Math.PI) + this.y)
		console.log(this)
	}
	static collision() {

	}
}
var atoms = [];

var ctx = canvas.getContext("2d");
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;
function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);


	for (const atom of atoms) {
		ctx.beginPath();
		ctx.fillStyle = atom.color;
		ctx.arc(atom.x, atom.y, atom.size, 0, TWO_PI);
		ctx.fill();

		for (const electron of atom.electrons) {
			ctx.fillStyle = "#FFA"
			ctx.beginPath();
			ctx.arc(electron.x, electron.y, 4, 0, TWO_PI);
			ctx.fill();
		}

		ctx.fillStyle = "#444";
		ctx.font = `bold ${atom.size}px monospace`;
		ctx.fillText(atom.type, atom.x - (atom.size / 4), atom.y + (atom.size / 4));
	}
}

function process() {
	const esm = 0.2;

	for (var i in atoms) {
		const a = atoms[i];
		atoms[i].x += a.xVel;
		atoms[i].y += a.yVel;

		//Wall Collision in the X Direction
		if (a.x > canvas.width - a.size) {
			atoms[i].x = canvas.width - a.size;
			atoms[i].xVel = 0 - Math.abs(a.xVel);
		} else if (a.x < a.size) {
			atoms[i].x = a.size;
			atoms[i].xVel = Math.abs(a.xVel);
		}

		//Wall collision in the Y direction
		if (a.y > canvas.height - a.size) {
			atoms[i].y = canvas.height - a.size;
			atoms[i].yVel = 0 - Math.abs(a.yVel);
		} else if (a.y < a.size) {
			atoms[i].y = a.size;
			atoms[i].yVel = Math.abs(a.yVel);
		}

		//Electrons
		for (electron of a.electrons) {
			//Electrons try to match the velocity of the atom they're attached to.
			//They accelerate faster towards their element if they're farther away.

			if (electron.x > a.x + 20) {
				electron.xVel -= Math.abs(a.xVel) * esm;
			} else if (electron.x < a.x - 20) {
				electron.xVel += Math.abs(a.xVel) * esm;
			}

			//Y direction
			if (electron.y > a.y + 20) {
				electron.yVel -= Math.abs(a.yVel) * esm;
			} else if (electron.y < a.y - 20) {
				electron.yVel += Math.abs(a.yVel) * esm;
			}

			//Move the electrons
			electron.x += electron.xVel;
			electron.y += electron.yVel;

			//Apply Air Friction
			electron.xVel *= Electron.FRICTION;
			electron.yVel *= Electron.FRICTION;

			//Wall Collision
			if (electron.x > canvas.width - Electron.RAD) {
				electron.x = canvas.width - Electron.RAD;
				electron.xVel = 0 - Math.abs(electron.xVel);
			} else if (electron.x < Electron.RAD) {
				electron.x = Electron.RAD;
				electron.xVel = Math.abs(electron.xVel);
			}

			if (electron.y > canvas.height - Electron.RAD) {
				electron.y = canvas.height - Electron.RAD;
				electron.yVel = 0 - Math.abs(electron.yVel);
			} else if (electron.y < Electron.RAD) {
				electron.y = Electron.RAD;
				electron.yVel = Math.abs(electron.yVel);
			}

			//Check collision with host atom; collision with other atoms needs to be
			//Processed differently because it can cause bonds.
			const distance = Particle.distance(electron, a);
			if (distance <= Electron.RAD + a.size) {
				//NI
	
				


				/*electron.xVel = -electron.xVel + 2 * a.xVel;
				electron.yVel = -electron.yVel + 2 * a.yVel;*/

			}
		}
	}
}

function loop() {
	process();
	render();
	window.requestAnimationFrame(loop.bind(this))
}

//atoms.push(new Atom('P', centerX, centerY, 3, 3))
loop();