console.logAsBin = function (num) {
    console.log(Simulator.pad(num.toString(2), 8, "0"))
}
class Register extends Number {
    constructor(value = 0) {
        super(value)
    }
    bitTest(index) {
        if (this.value >> index & 1) {
            return true
        }
        return false
    }
}
class Simulator {
    constructor(element) {

        //CREATE UI
        //create canvas and rendering context; used to render LCD
        this.canvas = document.createElement('canvas');
        element.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        element.appendChild(document.createElement('br'))

        //create input button for 6502 executable
        this.fileInput = document.createElement('input')
        this.fileInput.type = "file";
        this.fileInput.addEventListener("change", this.loadProg.bind(this))
        element.appendChild(this.fileInput);

        //Setting up reset button- this is crucial for audio
        this.startButton = document.createElement('button');
        this.startButton.innerHTML = 'Reset';
        element.appendChild(this.startButton);


        //Grab assets and finish setting up canvas
        this.assets = Simulator.assets;
        this.charset = this.assets.chartable;
        this.canvas.width = this.assets.background.width * 0.90;
        this.canvas.height = this.assets.background.height * 0.90;

        //Create LCD simulator
        this.display = Simulator.LCD(this.canvas, this.assets);
        console.log('Successful Simulator Start!')
        //Create Memory
        this.memory = Simulator.Memory()
        this.memory.write(0x8001, 'adsfasd')
        console.log(this.memory.read(0x4000))
        this.memory.write(0x6000)
        this.memory.iochip.controlLines.CB1 = true
        this.memory.iochip.controlLines.CB1 = false

        //Set up internal registers
        this.regA = 0;
        this.regX = 0;
        this.regY = 0;
        this.regP = 0;
        this.regPC = 0x600;
        this.regSP = 0xff;

        //Start the simulation!
        this.render();
    }
    render() {
        this.display.render.bind(this)();
    }
    execute() {
        //Executes one instruction
    }
    loadProg() {
        var fileObj = new BinFile();
        fileObj.setSourceBlob(this.fileInput.files[0])//Only takes the first file you submit; Ignores others
    }

    //STATIC METHODS
    static pad(string, padlen, padchar = " ", padfromright = false) {
        if (string.length >= padlen) return string;
        out = string;
        if (padfromright) {
            while (out.length < padlen) {
                out = out + padchar
            }
        } else {
            while (out.length < padlen) {
                out = padchar + out;
            }
        }
        return out;
    }
    static initSimulatorWidget(node) {
        return new Simulator(node)
    }
    static loadResources(completeLoadCallback) {
        //Loads the required resources for the simulator
        var total = 0
        var toLoad = {
            imgs: [
                { name: 'background', src: "LCD.png" }
            ],
            json: [
                { name: 'chartable', src: "chartable.json" }
            ]
        }
        this.assets = {}
        var obj = {
            count: 0,
            expectedCount: (toLoad.imgs.length + toLoad.json.length),
            loadFinished: completeLoadCallback
        }

        function loadCallback() {
            /*Whenever an asset loads, this callback fires. The total number of assets
            are stored, so when all the assets are loaded we call a main callback to 
            initialize all the modules.*/
            this.count++
            if (this.count == this.expectedCount) {
                console.log('Load Complete!')
                this.loadFinished();
            }
        }

        for (var i = 0; i < toLoad.imgs.length; i++) {
            var img = new Image();
            this.assets[toLoad.imgs[i].name] = img;
            img.onload = loadCallback.bind(obj)
            img.src = "assets/" + toLoad.imgs[i].src
        }
        for (var i = 0; i < toLoad.json.length; i++) {
            var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.open('GET', "assets/" + toLoad.json[i].src, true)
            xobj.onreadystatechange = (function (assets, toLoad, i, callback) {
                return function () {
                    if (xobj.readyState == 4 && xobj.status == "200") {
                        assets[toLoad.json[i].name] = JSON.parse(xobj.responseText);
                        callback();
                    }
                }
            })(this.assets, toLoad, i, loadCallback.bind(obj))
            xobj.send()
        }
    }
    static LCD(canvas, assets) {
        var lcd = {};
        lcd.canvas = canvas
        lcd.ctx = canvas.getContext('2d');
        lcd.canvas.width = assets.background.width * 0.90;
        lcd.canvas.height = assets.background.height * 0.90;
        lcd.ddram = [];
        for (i = 0; i < 128; i++) {
            lcd.ddram[i] = (' '.charCodeAt(0) - 1);//Display Initializes to spaces
        }
        lcd.cgram = new Array(64);
        lcd.rs = undefined; //True selects DDRAM/CGRAM, False indicates a command
        lcd.rw = undefined; //True means read, false means write
        lcd.bus = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

        lcd.on = false;
        lcd.showCursor = false;
        lcd.IncCursorPos = true;;//true for Increase, false for Decrease
        lcd.cursorBlink = false;
        lcd.DDramSelected = true;//true for DDRAM, false for CGRAM
        lcd.fullBus = true; //True for 8-bit bus, False for 4-bit bus
        lcd.twoLines = false; //True for 2 line mode, false for 1 line mode.
        lcd.bigFont = false; //True for 5x10 font, false for 5x7

        lcd.render = function () {
            var ps = 2, pd = 1, rows = 2, cols = 16, cwidth = 5, cheight = 8;
            lcd.ctx.drawImage(assets.background, 0, 0, lcd.canvas.width, lcd.canvas.height);
            lcd.ctx.fillStyle = "#000"
            var test = '';
            for (var cr = 0; cr < rows; cr++) {
                for (var cc = 0; cc < cols; cc++) {
                    for (var r = 0; r < cheight; r++) {
                        for (var c = 0; c < cwidth; c++) {
                            if ((r < 7) && (Simulator.pad(assets.chartable[lcd.ddram[(cr * 40) + cc]][r].toString(2), 5, '0', false)[c] == '1')) {
                                lcd.ctx.fillRect(50 + ((ps + pd) * 6) * cc + (ps + pd) * c, 60 + ((ps + pd) * 10) * cr + (ps + pd) * r, ps, ps)
                            }
                        }
                    }
                }
            }
        }.bind(this);
        lcd.run = function () {
            console.log('E Went Low!');
            console.log('IDK what to do now!')
        }.bind(this)

        lcd._e = undefined;
        Object.defineProperty(lcd, 'e', {
            get() {
                return this._e
            },
            set(e) {
                if (e == this._e) { return }
                this._e = e;
                if (this._e == false) {
                    this.run();
                }
            }
        })
        return lcd
    }
    static Memory() {
        var memarray = new Array(0xFFFF);
        var iochip = Simulator.IOchip();

        function write(address, value) {
            address = Simulator.pad(address.toString(2), 16, '0').split('').reverse();//TO DO- convert to '>>'s and &s
            console.log(address)
            if (address[14] == 0 && address[15] == 0) { //If in first quarter of mem//TO DO- convert to '>>'s and &s
                memarray[address] = value;
            } else if (address[14] == 1 && address[15] == 0 && address[13] == 1) { //TO DO- convert to '>>'s and &s
                iochip.write(parseInt(address.slice(0, 4).reverse().join(''), 2), value) //TO DO- convert to '>>'s and &s
            } else {
                console.warn('Write to ' + address + ' is invalid, data was not stored.')
            }
        }
        function read(address) {
            address = Simulator.pad(address.toString(2), 16, '0').split('').reverse();//TO DO- convert to '>>'s and &s
            if (address[15] == 0 && address[14] == 1 && address[13] == 0) {//TO DO- convert to '>>'s and &s
                console.warn('Nothing provides data at address ' + address + ', garbage data was read.')
                return Math.round(Math.random() * 255)
            } else if (address[14] == 1 && address[15] == 0 && address[13] == 1) {//TO DO- convert to '>>'s and &s
                return iochip.read(parseInt(address.slice(0, 4).reverse().join(''), 2))
            } else {
                return memarray[parseInt(address.join(''), 2)]
            }
        }
        return {
            read: read,
            write: write,
            iochip: iochip,
        }
    }
    static IOchip() {
        var registers = [];
        for (var i = 0; i < 16; i++) {
            registers[i] = new Register()
        }

        var controlLines = {};
        Simulator.makeControlLine(controlLines, 'CB1', (v) => {
            if (registers[12].bitTest(4)) {//bit 4 toggles between negative and positive edge triggers
                if (v) {
                    console.log('CB1 Triggered!')
                }
            } else {
                if (!v) {
                    console.log('CB1 Triggered!')
                }
            }
        });
        Simulator.makeControlLine(controlLines, 'CB2', (v) => {
            if (!registers[12].bitTest(7)) { //If bit 7 is on, CB2 is an output
                if (registers[12].bitTest(6)) {
                    if (registers[12].bitTest(5)) {
                        controlLines
                    } else {

                    }
                } else {

                }
            }
        });
        Simulator.makeControlLine(controlLines, 'CA1', (v) => {
            if (registers[0].bitTest(4)) {
                if (v) {//bit 0 toggles neg and pos edge triggers for CA1
                    console.log('CA1 Triggered!')
                }
            } else {
                if (!v) {
                    console.log('CA1 Triggered!');
                }
            }
        });
        Simulator.makeControlLine(controlLines, 'CA2', (v) => {

        });
        console.log(controlLines)
        function write(register, val) {
            console.log('Writing ' + val + ' to io chip register ' + register + '.')
        }
        function read(register) {
            return registers[register]
        }
        return {
            read: read,
            write: write,
            registers: registers,
            controlLines: controlLines,
        }
    }
    static makeControlLine(object, name, callback) {
        Object.defineProperty(object, name, {
            set(v) {
                if (this['_' + name] == v) { return }
                this['_' + name] = v
                callback(v);
            },
            get() {
                return this['_' + name]
            },
        });
        Object.defineProperty(object, ('_' + name), {
            value: false,
            writable: true
        })
    }
    static bin(num) {
        return this.pad(num.toString(2), 8, '0')
    }
}

Simulator.loadResources(() => {
    widgets = document.getElementsByClassName('widget');
    for (widget of widgets) {
        Simulator.initSimulatorWidget(widget);
    }
});