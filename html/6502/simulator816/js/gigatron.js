

class GigatronCPU {
    constructor() {
        this.speed = 6281250; //VGA clock speed of 25.125 mhz divided by 4 
        this.rom = new Uint16Array(1 << 16);
        this.romMask = this.rom.length - 1;

        //Ram is shared with the main cpu and is passed as a parameter to the Tick function
        this.ramMask = 1 << 15 - 1;
        this.reset();

        //Fill ram with randomness
        for (let i = 0; i < this.ram.length; i++) {
            this.ram[i] = Math.floor(Math.random() * 256);
        }
    }
    /** Resets registers to power-on state */
    reset() {
        this.pc = 0;
        this.nextpc = (this.pc + 1) & this.romMask;
        this.ac = 0;
        this.x = 0;
        this.y = 0;
        this.out = 0;
        this.xout = 0;
        this.in = 0xff; //Active low!
    }
    tick(sharedRam) {
        this.ram = sharedRam;
        let pc = this.pc;
        this.pc = this.nextpc;
        this.nextpc = (this.pc + 1) & this.romMask;

        //Fetch instrution from rom
        let ir = this.rom[pc];

        //Decode instruction
        let op = (ir >> 13) & 0x0007;
        let mode = (ir >> 10) & 0x0007;
        let bus = (ir >> 8) & 0x0003;
        let d = (ir >> 0) & 0x00FF;

        switch (op) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                this.aluOp(op, mode, bus, d);
                break;
            case 6:
                this.storeOp(mode, bus, d);
                break;
            case 7:
                this.branchOp(mode, bus, d);
                break;
        }
    }
    aluOp(op, mode, bus, d) {
        let b;

        switch (bus) { //Perform the correct bus action
            case 0:
                b = d;
                break;
            case 1:
                let addr = this.addr(mode, d) & this.ramMask;
                b = this.ram[addr];
                break;
            case 2:
                b = this.ac;
                break;
            case 3:
                b = this.in;
                break;
        }

        switch (op) { //Perform the correct operation
            case 1:
                b = this.ac & b;
                break;
            case 2:
                b = this.ac | b;
                break;
            case 3:
                b = this.ac ^ b;
                break;
            case 4:
                b = (this.ac + b) & 0xff;
                break;
            case 5:
                b = (this.ac - b) & 0xff;
                break;
        }

        switch (mode) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.ac = b;
                break;
            case 4:
                this.x = b;
                break;
            case 5:
                this.y = b;
                break;
            case 6:
            case 7:
                let rising = ~this.out & b;
                this.out = b;

                // rising edge of out[6] registers outx from ac
                if (rising & 0x40) {
                    this.outx = this.ac;
                }

                break;
        }
    }
    storeOp(mode, bus, d) {
        let b;

        switch (bus) {
            case 0:
                b = d;
                break;
            case 1:
                b = 0;
                console.warn('UNDEFINED BEHAVIOR!');
                break;
            case 2:
                b = this.ac;
                break;
            case 3:
                b = this.in;
                break;
        }

        let addr = this.addr(mode, d) & this.ramMask;
        this.ram[addr] = b;

        switch (mode) {
            case 4: // XXX not clear whether x++ mode takes priority
                this.x = b;
                break;
            case 5:
                this.y = b;
                break;
        }
    }
    branchOp(mode, bus, d) {
        const ZERO = 0x80;
        let c;
        let ac = this.ac ^ ZERO;
        let base = this.pc & 0xff00;

        switch (mode) {
            case 0: // jmp
                c = true;
                base = this.y << 8;
                break;
            case 1: // bgt
                c = ac > ZERO;
                break;
            case 2: // blt
                c = ac < ZERO;
                break;
            case 3: // bne
                c = ac != ZERO;
                break;
            case 4: // beq
                c = ac == ZERO;
                break;
            case 5: // bge
                c = ac >= ZERO;
                break;
            case 6: // ble
                c = ac <= ZERO;
                break;
            case 7: // bra
                c = true;
                break;
        }

        if (c) {
            let b = this.offset(bus, d);
            this.nextpc = base | b;
        }
    }
    //Calculates a ram address
    addr(mode, d) {
        switch (mode) {
            case 0:
            case 4:
            case 5:
            case 6:
                return d;
            case 1:
                return this.x;
            case 2:
                return (this.y << 8) | d;
            case 3:
                return (this.y << 8) | this.x;
            case 7:
                let addr = (this.y << 8) | this.x;
                this.x = (this.x + 1) & 0xff;
                return addr;
        }
    }
    offset(bus, d) {
        switch (bus) {
            case 0:
                return d;
            case 1:
                // RAM always has at least 1 page, so no need to mask address
                return this.ram[d];
            case 2:
                return this.ac;
            case 3:
                return this.in;
        }
    }
}