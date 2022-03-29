//Editor States

//-1 = loading, 0 = creating block, 1 = stable, 1.5 = moving editor, 2 = editing block, 3 = deleting block

export class State { //global state object, holds state info.
	constructor(state=1) {

		this.loaded = true;
		this.sidebarOpen = false;
		this.makingBlock = false;
		this.editingBlock = false;
		this.blocks = [];
		this.editingBlockIndex = undefined;
		this.mouse = {
			x: undefined,
			y: undefined
		}
	}
	get currentBlock (){
		return this.blocks[this.editingBlockIndex];
	}
	set currentBlock (v){
		this.blocks[this.editingBlockIndex] = v;
	}
}

export class Event {
	constructor() {

	}
}