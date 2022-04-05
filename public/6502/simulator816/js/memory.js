
export class Memory extends Uint8Array {
    constructor() {
        super(1 << 24); //65816 can access 16777216 bytes because it has an address width of 24
        let page = this.length / 256
        console.groupCollapsed("Randomizing Startup RAM")
        for (let i = 0; i < this.length; i += page) {
            for (let j = 0; j < i + page; j++) {
                this[i] = Math.floor(Math.random() * 256);
            }
            console.log(`${i / page}/256 pages randomized`)
        }
        console.groupEnd();
    }
}