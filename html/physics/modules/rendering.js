export class Renderer {
    constructor(engine, canvas) {

        this.resize = this.resize.bind(this);
        this.render = this.render.bind(this);

        this.engine = engine;
        this.canvas = canvas;

        this.width = canvas.width;
        this.height = canvas.height;

        //Canvas Init
        this.ctx = canvas.getContext("2d");
        this.resize();
        this.clear();
        window.addEventListener("resize",this.resize)

        this.bpos = 0;

    }
    clear() {
        this.ctx.clearRect(0,0,this.width, this.height);
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    start() {
        requestAnimationFrame(this.render);
    }
    render(timestamp) {
        if (this.prevTimestamp === undefined) {
            this.prevTimestamp = timestamp;
        }
        const deltaTime = (timestamp - this.prevTimestamp) / 1000; //Time since last frame draw, in seconds (not miliseconds)
        this.prevTimestamp = timestamp;

        var c = this.ctx;
        this.clear();

        c.fillStyle = "#000000"
        c.fillRect(this.bpos,0,10,10);

        this.bpos += 50 * deltaTime;
        if (this.bpos > this.width) {
            this.bpos = 0;
        }

        requestAnimationFrame(this.render)
    }
}