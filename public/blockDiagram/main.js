import { Sidebar } from "./src/sidebar.js";
import { Block } from "./src/objects.js";
import { State } from "./src/states.js"


export let CREATED = false;
class BlockDiagram {
    constructor(element, config = {}) {
        console.assert(!CREATED, "Create app twice!");
        CREATED = true;

        //General Init
        this.containerElement = element;
        this.state = new State();  //0 = creating block, 1 = stable, 1.5 = moving editor, 2 = editing block, 3 = deleting block
        this.style = {
            blocks: {
                textColor: "rgb(200,200,200)",
                blockColor: "rgb(20,20,20)"
            },
        }

        //CANVAS CONFIG
        this.c = document.createElement('canvas');
        this.c.addEventListener('contextmenu', e => { e.preventDefault() }); //Prevent right clicks from opening menu
        this.containerElement.appendChild(this.c); //adding it to the doc
        this.ctx = this.c.getContext('2d');
        this.resize();

        //SIDEBAR CONFIG
        this.sidebar = new Sidebar(this.containerElement, this.state);

        //EVENT LISTENER SETUP
        window.addEventListener("resize", this.resize.bind(this))
        this.containerElement.addEventListener('mousemove', this.mouseMove.bind(this))
        this.containerElement.addEventListener('mousedown', this.mouseClick.bind(this))
    }
    resize() {
        //resize handler
        this.c.width = window.innerWidth;
        this.c.height = window.innerHeight;
        this.render();
    }
    render() {
        //Renders the screen
		this.ctx.clearRect(0, 0, this.c.width, this.c.height);


        //draw current working block
        this.ctx.beginPath();
        if (this.state.makingBlock) {
            //draw block
            this.state.currentBlock.width = this.state.mouse.x - this.state.currentBlock.x;
            this.state.currentBlock.height = this.state.mouse.y - this.state.currentBlock.y;

            const cb = this.state.currentBlock;

            this.ctx.fillStyle = this.style.blocks.blockColor
            this.ctx.fillRect(cb.x, cb.y, cb.width, cb.height)
            //draw block name
            this.ctx.fillStyle = this.style.blocks.textColor
            this.ctx.fillText(
                cb.name,
                cb.x + cb.width / 2 - (this.ctx.measureText(cb.name).width / 2),
                cb.y + (cb.height / 2)
            )
        }

        //draw all other blocks
        //console.log(this.state.blocks.length)
        for (var i = 0; i < this.state.blocks.length; i++) {
            //draw the block
            this.ctx.fillStyle = this.style.blocks.blockColor
            this.ctx.fillRect(this.state.blocks[i].x1, this.state.blocks[i].y1, this.state.blocks[i].width, this.state.blocks[i].height)

            //draw the block's name
            this.ctx.fillStyle = this.style.blocks.textColor
            this.ctx.fillText(
                this.state.blocks[i].name,
                this.state.blocks[i].x1 + (this.state.blocks[i].width / 2) - (this.ctx.measureText(this.state.blocks[i].name).width / 2),
                //X-pos of block + offset to get the x of the text center - 1/2 of text's length to get the text centered
                this.state.blocks[i].y1 + (this.state.blocks[i].height / 2)
            )

            //draw connection labels (not implemented)
        }
        //draw connections (not implemented)

        //if (this.state.makingBlock) {
        requestAnimationFrame(this.render.bind(this))
        //}
    }
    mouseMove(e) {
        //mouse move handler
        this.state.mouse.x = e.clientX;
        this.state.mouse.y = e.clientY;
    }
    mouseClick(e) {
        //mouse click handler
        var mouse = { x: e.clientX, y: e.clientY }
        var collisions = this.detectBlockCollision(mouse.x, mouse.y)

        console.log(e.button)
        if (e.button == 0) {
            //Left Click
            if (this.state.makingBlock) { //Left click while making block cancels it
                this.state.blocks.splice(this.state.editingBlockIndex, 1); //Remove prototype block
                this.state.makingBlock = false;
            } else {
                if (collisions.length == 1) {
                    this.state.editingBlockIndex = collisions[0];
                    this.sidebar.open();
                    this.render();
                } else if (collisions.length == 0) {
                    //clicked on background, slide the editor
                } else if (collidions.length > 1) {
                    throw "Somehow clicked on multiple blocks at once!!!?!??"
                }
            }

        } else if (e.button == 1) {
            //Middle click; slide editor

        } else if (e.button == 2) {
            //Right Click

            if (this.state.makingBlock) {
                //If Making a block, finish it.
                this.makeNewBlock(mouse.x, mouse.y);
            } else {
                if (this.state.sidebarOpen) {
                    this.sidebar.close();
                }
                if (collisions.length == 0) {
                    this.startNewBlock(mouse.x, mouse.y);
                } else {
                    alert("Temporary Alert: You can't make a block on top of a block!!");
                }
            }
        }
    }

    detectBlockCollision(x, y) {
        //checks if a given point intersects with any block and returns a list of indexes of all the blocks it collides with.
        var outArray = []
        for (var i = 0; i < this.state.blocks.length; i++) {
            if (x > this.state.blocks[i].x1 && x < this.state.blocks[i].x2 && y > this.state.blocks[i].y1 && y < this.state.blocks[i].y2) {
                outArray.push(i)
            }
        }
        return outArray
    }

    startNewBlock(x, y) {
        this.state.makingBlock = true;
        this.state.editingBlockIndex = this.state.blocks.push(new Block(x, y, 0, 0)) - 1 //Push returns length of the array and the element pushed is going to be at the index one less than that
        this.render.bind(this)();
    }

    makeNewBlock(x, y) {
        if (this.detectBlockCollision(x, y).length == 0) {
            this.state.currentBlock.x2 = x;
            this.state.currentBlock.y2 = y;
            this.state.makingBlock = false;
        } else {
            console.log(detectBlockCollision(x, y))
            console.warn("Cannot create blocks inside blocks.")
        }
    }

    setterCallback(property, value) {
        console.log('setting this.' + property + ' to ' + value + '.')
        this[property] = value
    }
}


window.addEventListener('load', ()=>{
    new BlockDiagram(document.getElementById('blockDiagram'))
});