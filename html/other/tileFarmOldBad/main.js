

import * as Graphics from "./src/engine/graphics.js";
import * as Logic from "./src/logic.js";
import * as Input from "./src/input.js";
import * as RM from "./src/engine/resourceManager.js";
import * as Obj from "./src/engine/objects.js";
import { REQUIRED } from "./src/config.js"


console.log("%cTile Farm%c\nMade by %cWill Kam", "font-size: 35px;font-weight: bold; padding: 10px 0;", "color: #aaa", "color: #7f7");
class Game {
	constructor() {
		this.state = new Logic.GameState(); //Create Gamestate
		this.logic = new Logic.GameLogic(this.state); //Create Game Logic
		this.display = new Graphics.Display(document.body, window.innerWidth, window.innerHeight); //Make and configure Webgl Canvas (display)
		this.resManager = new RM.ResourceManager(this.display.renderingContext, this.state, REQUIRED);

		this.resManager.onCompleteLoad = (e) => {
			console.log("Assets have loaded, finishing intialization")
			this.state.objects.push(new Obj.Cube(-1, 0, -1, 2, this.resManager.res.textures.cubeTexture))
			console.log("Cube Obj: ", this.state.objects[0], this.state.objects[0].getFaceIndices(), this.state.objects[0].getRawPoints())

			this.inputManager = new Input.InputManager(document.body, this.logic);
			this.renderer = new Graphics.Rendererer(this.display, this.state, this.resManager.res); //Self Explanitory
			this.timeLastRendered = 0;
			this.start();
		}
		this.resManager.start(); //Prevent race condition
	}
	mainLoop(now) {
		//Calculate Delta
		now *= 0.001 //Convert to seconds
		const deltaTime = now - this.timeLastRendered; //Get time since last render;
		this.timeLastRendered = now;

		this.logic.tick(deltaTime);
		this.renderer.render();

		//Continue Looping
		if (this.state.run) {
			requestAnimationFrame(this.mainLoop.bind(this));
		}
	}
	start() {
		console.log("Starting Main loop!!")
		if (this.state.started) {
			console.log("Already Started!!");
			return
		}
		requestAnimationFrame(this.mainLoop.bind(this))
	}
}
var game = new Game();