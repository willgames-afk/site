
import { Vec } from "./vec2.js";

class Block {
    constructor(pos, size, name) {
        this.size = size;
        this.pos = pos;
        this.name = name;
    }
    draw(ctx,color,textcolor) {
        ctx.fillStyle = color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        //draw block name;
        ctx.fillStyle = textcolor;
        ctx.fillText(
            this.name,
            this.pos.x + this.size.x / 2 - (ctx.measureText(this.name).width / 2),
            this.pos.y + (this.size.y / 2)
        );
    }
}

export let CREATED = false;

const MODE_MOVE = 'move';
const MODE_CREATE = 'create';

class BlockDiagram {
    constructor(element, config = {}) {
        console.assert(!CREATED, "Create app twice!");
        CREATED = true;

        //General Init
        this.containerElement = element;
        this.loaded = true;
		this.sidebarOpen = false;
		this.editingBlock = false;
        this.mode = false
		this.blocks = [];
		this.mouse = new Vec(null,null);
        //0 = creating block, 1 = stable, 1.5 = moving editor, 2 = editing block, 3 = deleting block
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

        if (this.editingBlock) {
            this.blocks[this.editingBlock-1].size = this.mouse.sub(this.blocks[this.editingBlock-1].pos)
        }

        //draw all other blocks
        //console.log(this.state.blocks.length)
        for (const block of this.blocks) {

            //draw the block
           block.draw(this.ctx, this.style.blocks.blockColor, this.style.blocks.textColor);
            //draw connection labels (not implemented)
        }
        //draw connections (not implemented)
        //this.ctx.closePath();

        if (this.editingBlock) {
            requestAnimationFrame(this.render.bind(this))
        }
    }
    mouseMove(e) {
        //mouse move handler
        this.mouse = new Vec(e.clientX, e.clientY);
    }
    mouseClick(e) {
        //mouse click handler
        this.mouse  = new Vec(e.clientX, e.clientY);
        
        var collisions = this.detectBlockCollision(this.mouse)

        console.log(e.button)
        if (e.button == 0) {
            //Left Click
            if (this.editingBlock) { //Left click while making block cancels it
                this.blocks.splice(this.editingBlock-1, 1); //Remove prototype block
                this.editingBlock = false;
            } else {
                if (collisions.length == 1) {
                    //this.editingBlock = collisions[0] + 1;
                    this.sidebar.open(collisions[0] + 1);
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

            if (this.editingBlock) {
                //If Making a block, finish it.
                if (this.detectBlockCollision(this.mouse).length == 0) {
                    this.blocks[this.editingBlock-1].size = this.mouse.sub(this.blocks[this.editingBlock-1].pos)
                    this.editingBlock = false;
                } else {
                    //console.log(detectBlockCollision(x, y))
                    console.warn("Cannot create blocks inside blocks.")
                }
                console.log(this);
            } else {
                if (this.sidebarOpen) {
                    this.sidebar.close();
                }
                if (collisions.length == 0) {
                    this.startNewBlock(this.mouse);
                } else {
                    alert("Temporary Alert: You can't make a block on top of a block!!");
                }
            }
        }
    }

    detectBlockCollision(loc) {
        //checks if a given point intersects with any block and returns a list of indexes of all the blocks it collides with.
        var outArray = []
        for (const i in this.blocks) {
            const block = this.blocks[i];
            if (loc.x > block.x && loc.x < (block.x + block.width) && loc.y > block.y && loc.y < (block.y+block.width)) {
                outArray.push(i)
            }
        }
        return outArray
    }

    startNewBlock(loc) {
        this.editingBlock = this.blocks.push(new Block(loc, new Vec(10, 10), "New Block")) //Push returns length of the array and the element pushed is going to be at the index one less than that
        this.render.bind(this)();
    }

    makeNewBlock(loc) {
        if (this.detectBlockCollision(loc).length == 0) {
            this.blocks[this.editingBlock-1].size = this.mouse.sub(this.blocks[this.editingBlock-1].pos)
            this.editingBlock = false;
        } else {
            console.log(detectBlockCollision(loc))
            console.warn("Cannot create blocks inside blocks.")
        }
        console.log(this);
    }

    setterCallback(property, value) {
        console.log('setting this.' + property + ' to ' + value + '.')
        this[property] = value
    }
}


window.addEventListener('load', ()=>{
    new BlockDiagram(document.getElementById('blockDiagram'))
});