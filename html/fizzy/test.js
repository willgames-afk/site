import {Game} from "./engine/main.js"

var game = new Game({
	init(O) {
		O.load("spritesheet", "sheet.json");
		O.width = 180;
		O.height = 120;
		O.pixelartmode = true;
		O.scale = 2;
	},
	start(O) {
		O.make("orange","banana",0,0);
	},
	loop(O) {
		O.drawColor = "#000";
		O.draw("fillRect",0,0,O.width,O.height);

		O.draw("orange");
	}
});

document.body.appendChild(game.canvas);