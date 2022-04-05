export class InputManager {
	constructor(DOMElement,gameLogic) {
		this.DOMElement = DOMElement;
		this.gameLogic = gameLogic;
		this.initEventListeners();
	}
	initEventListeners() {
		this.DOMElement.addEventListener("keydown", this.onkeydown.bind(this));
		this.DOMElement.addEventListener("keyup", this.onkeyup.bind(this));
		this.DOMElement.addEventListener("mousemove", this.onmousemove.bind(this));
		this.DOMElement.addEventListener("click", this.DOMElement.requestPointerLock)
	}
	onkeydown(e) {
		this.gameLogic.gameState.keys[e.code] = true;
	}
	onkeyup(e) {
		this.gameLogic.gameState.keys[e.code] = false;
	}
	onmousemove(e) {
		this.gameLogic.updateDirection.bind(this.gameLogic)(e.movementX,e.movementY)
	}
}