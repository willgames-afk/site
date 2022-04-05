
const VSYNC = 0x80;
const HSYNC = 0x40;

const timings = {
    h: {
        frontPorch: 16,
        pulse: 96,
        visible: 640,
        backPorch: 48,
    },
    v: {
        frontPorch: 6,
        pulse: 8,
        visible: 480,
        backPorch: 27
    }
}

class VGADisplay {
    constructor(parentElement) {


        //Create Canvas
        this._canvas = document.createElement("canvas");
        this._canvas.width = timings.h.visible;
        this._canvas.height = timings.v.visible;
        parentElement.appendChild(this._canvas);

        //Create drawing context 
        this._ctx = this._canvas.getContext("2d");

        //Get canvas image data
        this._ctx.fillStyle = "#000000FF";
        this._ctx.fillRect(0,0,timings.h.visible,timings.v.visible); //Turn all pixels opaque black
        var imgdata = this._ctx.getImageData(0, 0, timings.h.visible, timings.v.visible);

        this._data = imgdata.data;
        //this.videoMode = 0; //6 bit fixed color

        this.prevOut = 0;//Previous gcpu output register value. Used for detecting hsync/vsync
        
        this.row = 0;//Current row
        this.minRow = timings.v.backPorch + timings.v.pulse; //Used to detect if a row is in the visible part of the display
        this.maxRow = this.minRow + timings.v.visible; 

        this.col = 0; //Current col
        this.minCol = timings.h.backPorch + timings.h.pulse; //Same as rows, just for columns
        this.maxCol = this.minCol + timings.h.visible;

        this.pixel = 0; //Current pixel, used for accessing image data 
    }
    update() {
        this._ctx.putImageData(this._data);
    }
    /** Advance simulation by 1 tick. 
     * @param {GigatronCPU}
     */
    tick(gcpu) {
        let out = gcpu.out;
        let fallingBits = this.out & ~out; //Detect falling edge pixels

        if (fallingBits & VSYNC) {
            this.row = -1;
            this.pixel = 0;
            this.update();
        }

        if (fallingBits & HSYNC) {
            this.col = 0;
            this.row++;
        }

        this.out = out;

        if ((this.row >= this.minRow && this.row < this.maxRow) &&
            (this.col >= this.minCol && this.col < this.maxCol)) {
            let pixels = this._data;
            let pixel = this.pixel;
            let r = out & 3;
            let g = out >> 2 & 3;
            let b = out >> 4 & 3;

            for (let i=0;i<4;i++) {
                pixels[pixel++] = 85 * r;
                pixels[pixel++] = 85 * g;
                pixels[pixel++] = 85 * b;
                pixel++
            }
            this.pixel = pixel;
        }
        this.col += 4;
    }
}

module.exports = { VGADisplay };