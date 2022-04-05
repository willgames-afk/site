import { randomUInt16, randomBit, randomUInt8 } from "./helpers";

const VECTORS = {
    emuMode: {
        //Reserved:0x00FFF0,
        //Reserved:0x00FFF2,
        cop: 0x00FFF4, //All of these are 2 bytes long and form a 16 bit address
        //Reserved:0x00FFF6,
        abort: 0x00FFF8,
        nmi: 0x00FFFA,
        reset: 0x00FFFC,
        irqbrk: 0x00FFFE,
    },
    nativeMode: {
        //Reserved:0x00FFF0,
        //Reserved:0x00FFF2,
        cop: 0x00FFE4,
        brk: 0x00FFE6,
        abort: 0x00FFE8,
        nmi: 0x00FFEA,
        //Reserved:0x00FFEC,
        irq: 0x00FFEE,
    }
}
export class MainCPU {
    constructor() {
        //Randomize Registers- only happens on startup; resets don't re-randomize.

        this.regSP = randomUInt16(); //Upper half will be initialized in reset
        this.regX = randomUInt16();
        this.regY = randomUInt16();
        this.regA = randomUInt16();
        this.regP = randomUInt8();
        this.running = true;

        this.reset();
    }


    /** Resets registers to defauts */
    reset() {
        this.regSP = 0x0100 | (this.regSP & 0xff); //Upper byte initialized to 

        this.regPB = 0; //Program Bank
        this.regDB = 0; //Data Bank
        this.regD = 0; //Memory offset register
        this.flags = {
            //n: null,
            //v: null,
            m: 1,
            x: 1, //b: false,
            d: 0,
            i: 1,
            //z: null,
            /*c: null,*/ e: 1
        };

        this.regX = 0x0000 | (this.regPC & 0xff);
        this.regY = 0x0000 | (this.regPC & 0xff);
        //this.regA = null; //Accumulator isn't initialized
    }
    instructions = [

        () => {
            this.running = false;
            //BRK
        },

        () => {
            //ORA (d,x)
        },

        () => {
            //COP s
        },

        () => {
            //ORA d,s
        },

        () => {
            //TSB d
        },

        () => {
            //ORA d
        },

        () => {
            //ASL d
        },

        () => {
            //ORA [d]
        },

        () => {
            this.stackPush(this.regP | 0x30);
            //PHP
        },

        () => {
            this.regA |= this.popByte();
            this.ORA();
        },

        () => {
            this.setCarryFlagFromBit7(regA);
            this.regA = (this.regA << 1) & 0xff;
            this.ASL(this.regA);
        },

        () => {
            //PHD
        },

        () => {
            //TSB
        },

        () => {
            this.regA |= this.memory.get(this.popWord());
            ORA();
        },

        () => {
            var addr = this.popWord();
            var value = this.memory.get(addr);
            this.setCarryFlagFromBit7(value);
            value = value << 1;
            this.memory.storeByte(addr, value);
            this.ASL(value);
        },

        () => {
            //ORA al
        },

        //10
        () => {
            var offset = this.popByte();
            if (!this.negativeSet()) { jumpBranch(offset); }
            //BPL
        },

        () => {
            //ORA (d),y
        },

        () => {
            //ORA (d)
        },

        () => {
            //ORA (d,s),y
        },

        () => {
            //TRB d
        },

        () => {
            //ORA d,x
        },

        () => {
            //ASL d,x
        },

        () => {
            //ORA [d],y
        },

        () => {
            //CLC unchanged
        },

        () => {
            //ORA a,y unchanged
        },

        () => {
            //INC A unchanged
        },

        () => {
            //TCS
        },

        () => {
            //TRB a unchanged
        },

        () => {
            //ORA a,x unchanged
        },

        () => {
            //ASL a,x unchanged
        },

        () => {

        },

        //20
        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        },

        () => {

        }
    ]
}