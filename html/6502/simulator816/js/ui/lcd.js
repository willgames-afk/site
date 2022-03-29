const config = {
	bus: "A", //6522 port used for data bus comms
	control: "B",
	e: 0, //Pin used for E line
	rs: 1,
	rw: 2,

	graphics: {
		pixelSize: 3,
		pixelSpacing: 1,
		charSpacing: 1,
		offset: [45, 65],

		pixel: "rgb(38,59,53)",
		noPixel: "#00a010",
		on: "#00ff6650",

		onBox: [[38, 53], [354, 88]]
	},

	charMap: '\0\t\n\r !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\134]^_`abcdefghijklmnopqrstuvwxyz{|}~�������������\215�\217\220������������\235��������������������������������������������������������������������������������������������������'
}

/** Rounded Rectangle drawing function for the Canvas.
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 * @param {Number} height 
 * @param {Number|Object} radius 
 */
function fillRoundedRect(ctx, x, y, width, height, radius) {
	if (typeof stroke === 'undefined') {
		stroke = true;
	}
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = { tl: radius, tr: radius, br: radius, bl: radius };
	} else {
		var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	
	ctx.fill();
}

class LCDDisplay {
	/** Creats an LCDDisplay
	 * @param {HTMLElement} parentElement The DOM element the LCD Display interface will be added to
	 * @param {VIA} slowBus The slowBus 6522 IO chip used to communicate with the LCD
	 * @param {Loader} loader A Loader object used to load the background image and the font for the lcd
	 */
	constructor(parentElement, slowBus, loader) {
		loader.addLoadFile("lcd", "LCD.png", { type: "img" });
		loader.addLoadFile("lcdFont", "lcd_font.json", { type: "json" })
		this._canvas = document.createElement("canvas");
		parentElement.appendChild(this._canvas);

		this.loader = loader;

		this._ctx = this._canvas.getContext("2d");

		this.IOChip = slowBus;
		this._shift = 0; //Current shift

		this.cgram = new Uint8Array(64);
		this.ddram = new Uint8Array(80);

		for (var i = 0; i < this.ddram.length; i++) {
			this.ddram[i] = 0x20; //Clears to space chars (0x20) normally, setting it to 9 for debugging purposes
		}

		var string = "Hello, World!";
		for (var i = 0; i < string.length; i++) {
			this.ddram[i] = string.charCodeAt(i)
		}

		this.regDL = 0;//Data length;  4 bits (0) or 8 bits (1)
		this.regN = 0; //              1 line (0) or 2 lines (1)
		this.regF = 0; //font;       5x8 dots (0) or 5x10 dots (1)
		this.regS = 0; // Don't shift display (0) or Shift display (1)
		this.regID = 0;//    Decrement cursor (0) or increment cursor (1)

		this.regOn = 0;//  Entire Display off (0) or on (1)
		this.regC = 0; //          Cursor off (0) or on (1)
		this.regB = 0; //    Cursor Blink off (0) or on (1)

		this._regAC = 0;

		this.busy = 0;//Busy Flag
	}
	get regAC() {
		return this._regAC;
	}
	set regAC(v) {
		if (this.regMS) {
			this._regAC = v % 64 //CGRAM has 64 bytes, wraps around after that.
		} else {
			this._regAC = v % 80 //DDRAM has 80 chars in it; wraps around after that
		}
	}
	getData() {
		this.regAC++;
		if (this.regMS) {
			return this.cgram[this.regAC - 1];
		} else {
			return this.ddram[this.regAC - 1];
		}
	}
	writeData(v) {
		this.regAC++;
		if (this.regMS) {
			this.cgram[this.regAC - 1] = v
		} else {
			this.ddram[this.regAC - 1] = v
		}
		this.update();
	}
	reset() {
		this.regAC = 0;
		this.regMS = 0; //Mem Select-   DDRAM (0) or CGRAM (1)
	}
	_writeToBus(v) {
		this.IOChip[config.bus] = v
	}
	onEnable() {
		const rw = this.IOChip[config.control][config.rw];
		const rs = this.IOChip[config.control][config.rs];
		const bus = this.IOChip[config.bus];
		if (rs) {
			if (rw) {
				//Read from --RAM
				this._writeToBus(this.getData());
			} else {
				//Write to --RAM
				this.writeData(bus);
			}
		} else {
			if (rw) {
				//Read Busy flag and regAC
				this._writeToBus(this.busy << 7 | this.regAC);
			} else {
				//Send Instruction
				if (bus & 128) { //If DB7 is set
					//Set DDRAM address
					this.regMS = 0;
					this.regAC = bus & 0x7f

				} else if (bus & 64) {
					//Set CGRAM address
					this.regMS = 1;
					this.regAC = bus & 0x3F;

				} else if (bus & 32) {
					//Function set
					this.regDL = bus & 16;
					this.regN = bus & 8;
					this.regF = bus & 4

				} else if (bus & 16) {
					//Shift Display/Cursor
					this.regSC = bus & 8;
					this.regRL = bus & 4;

				} else if (bus & 8) {
					//Display on/off
					this.regOn = bus & 4;
					this.regC = bus & 2;
					this.regB = bus & 1;

				} else if (bus & 4) {
					//Cursor direction and display shift
					this.regID = bus & 2;
					this.regS = bus & 1;

				} else if (bus & 2) {
					//Return to Home
					this._shift = 0;
					this.regMS = 0;
					this.regAC = 0;
				} else if (bus & 1) {
					//Clear entire display and set ddram to 0;
					this.regAC = 0;
					this.regMS = 0;
				}
			}
		}
	}
	update() {
		let c = this._ctx;
		let pixelSize = config.graphics.pixelSize + config.graphics.pixelSpacing;
		let offset = config.graphics.offset;
		let truePixelSize = config.graphics.pixelSize;
		let charSpacing = config.graphics.charSpacing;

		let pxcolor = config.graphics.pixel;
		let nopxcolor = config.graphics.noPixel;

		var font = this.font;
		let cgram = this.cgram;
		let position = this.regAC;

		c.clearRect(0, 0, this._canvas.width, this._canvas.height);
		c.drawImage(this.img, 0, 0);
		c.fillStyle = config.graphics.on;
		fillRoundedRect(c, config.graphics.onBox[0][0], config.graphics.onBox[0][1], config.graphics.onBox[1][0], config.graphics.onBox[1][1],4)

		/*
		var pos = pchr.arguments[1] * 8
		for (var i = 0; i < 7; i += 1) {
			document['p' + (pos + i)].src = chrtbl[chrnum][i] + '.gif'
		}

		if (chrnum < 8) {
			document['p' + (pos + 7)].src = chrtbl[chrnum][7] + '.gif'
		} else {
			document['p' + (pos + 7)].src = '0.gif'
		}
		*/

		function pxrow(x, y, num) {
			for (var i = 0; i < 5; i++) {
				//console.log((num & (1 << i)) == 0)
				if (num.toString(2).padStart(5, "0")[i] == "1") {
					c.fillStyle = pxcolor;
				} else {
					c.fillStyle = nopxcolor;
				}
				c.fillRect(x + i * (pixelSize - 1), y, truePixelSize - 1, truePixelSize);
			}
		}

		function char(id, x, y, code) {
			//console.log(code)
			//console.log(font)
			console.log(`id: ${id} pos: ${position}`);
			var s = ""
			if (code > 7) {
				for (var i = 0; i < 7; i++) {
					s += font[code][i].toString(2).padStart(5, "0") + "\n"
					pxrow(x, y + i * pixelSize, font[code][i]);

				}
			} else {
				for (var i = 0; i < 8; i++) {

					pxrow(x, y + i * pixelSize, cgram[code + i * 8]);

				}
			}
			if (id == position) {
				pxrow(x, y + 7 * pixelSize, 31); //cursor is a solid line rendered underneath 5x7 font; overwrites 5x8 cgram chars
			} else {
				pxrow(x, y + 7 * pixelSize, 0);
			}
			//console.log(s);
			//console.groupEnd();
		}

		function charRow(id, x, y, chars) {
			for (var i = 0; i < 16; i++) {
				char(id * 40 + i, x + i * 5 * (pixelSize) + charSpacing, y, chars[i]);
			}
		}

		//console.log(this.ddram.slice(this._shift, this._shift + 16))
		charRow(0, offset[0], offset[1], this.ddram.slice(this._shift, this._shift + 16));
		charRow(1, offset[0], offset[1] + 9 * pixelSize, this.ddram.slice(this._shift + 40, this._shift + 56));
	}
	init() {
		let c = this._ctx;

		this.img = this.loader.assets.lcd;
		this.font = this.loader.assets.lcdFont;

		console.log("LCD Initializing...")
		this._canvas.width = this.img.width;
		this._canvas.height = this.img.height;
		c.drawImage(this.img, 0, 0);
	}
}

module.exports = { LCDDisplay }