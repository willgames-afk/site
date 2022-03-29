class Assembler {
    constructor() {
        this.version = 'V0.1.0'
        this.output = ''
        this.opcodeLookup = [
            /* Name, Imm,  ZP,   ZPX,  ZPY,  ABS, ABSX, ABSY,  IND, INDX, INDY, SNGL, BRA */
            ["ADC", 0x69, 0x65, 0x75, null, 0x6d, 0x7d, 0x79, null, 0x61, 0x71, null, null],
            ["AND", 0x29, 0x25, 0x35, null, 0x2d, 0x3d, 0x39, null, 0x21, 0x31, null, null],
            ["ASL", null, 0x06, 0x16, null, 0x0e, 0x1e, null, null, null, null, 0x0a, null],
            ["BIT", null, 0x24, null, null, 0x2c, null, null, null, null, null, null, null],
            ["BPL", null, null, null, null, null, null, null, null, null, null, null, 0x10],
            ["BMI", null, null, null, null, null, null, null, null, null, null, null, 0x30],
            ["BVC", null, null, null, null, null, null, null, null, null, null, null, 0x50],
            ["BVS", null, null, null, null, null, null, null, null, null, null, null, 0x70],
            ["BCC", null, null, null, null, null, null, null, null, null, null, null, 0x90],
            ["BCS", null, null, null, null, null, null, null, null, null, null, null, 0xb0],
            ["BNE", null, null, null, null, null, null, null, null, null, null, null, 0xd0],
            ["BEQ", null, null, null, null, null, null, null, null, null, null, null, 0xf0],
            ["BRK", null, null, null, null, null, null, null, null, null, null, 0x00, null],
            ["CMP", 0xc9, 0xc5, 0xd5, null, 0xcd, 0xdd, 0xd9, null, 0xc1, 0xd1, null, null],
            ["CPX", 0xe0, 0xe4, null, null, 0xec, null, null, null, null, null, null, null],
            ["CPY", 0xc0, 0xc4, null, null, 0xcc, null, null, null, null, null, null, null],
            ["DEC", null, 0xc6, 0xd6, null, 0xce, 0xde, null, null, null, null, null, null],
            ["EOR", 0x49, 0x45, 0x55, null, 0x4d, 0x5d, 0x59, null, 0x41, 0x51, null, null],
            ["CLC", null, null, null, null, null, null, null, null, null, null, 0x18, null],
            ["SEC", null, null, null, null, null, null, null, null, null, null, 0x38, null],
            ["CLI", null, null, null, null, null, null, null, null, null, null, 0x58, null],
            ["SEI", null, null, null, null, null, null, null, null, null, null, 0x78, null],
            ["CLV", null, null, null, null, null, null, null, null, null, null, 0xb8, null],
            ["CLD", null, null, null, null, null, null, null, null, null, null, 0xd8, null],
            ["SED", null, null, null, null, null, null, null, null, null, null, 0xf8, null],
            ["INC", null, 0xe6, 0xf6, null, 0xee, 0xfe, null, null, null, null, null, null],
            ["JMP", null, null, null, null, 0x4c, null, null, 0x6c, null, null, null, null],
            ["JSR", null, null, null, null, 0x20, null, null, null, null, null, null, null],
            ["LDA", 0xa9, 0xa5, 0xb5, null, 0xad, 0xbd, 0xb9, null, 0xa1, 0xb1, null, null],
            ["LDX", 0xa2, 0xa6, null, 0xb6, 0xae, null, 0xbe, null, null, null, null, null],
            ["LDY", 0xa0, 0xa4, 0xb4, null, 0xac, 0xbc, null, null, null, null, null, null],
            ["LSR", null, 0x46, 0x56, null, 0x4e, 0x5e, null, null, null, null, 0x4a, null],
            ["NOP", null, null, null, null, null, null, null, null, null, null, 0xea, null],
            ["ORA", 0x09, 0x05, 0x15, null, 0x0d, 0x1d, 0x19, null, 0x01, 0x11, null, null],
            ["TAX", null, null, null, null, null, null, null, null, null, null, 0xaa, null],
            ["TXA", null, null, null, null, null, null, null, null, null, null, 0x8a, null],
            ["DEX", null, null, null, null, null, null, null, null, null, null, 0xca, null],
            ["INX", null, null, null, null, null, null, null, null, null, null, 0xe8, null],
            ["TAY", null, null, null, null, null, null, null, null, null, null, 0xa8, null],
            ["TYA", null, null, null, null, null, null, null, null, null, null, 0x98, null],
            ["DEY", null, null, null, null, null, null, null, null, null, null, 0x88, null],
            ["INY", null, null, null, null, null, null, null, null, null, null, 0xc8, null],
            ["ROR", null, 0x66, 0x76, null, 0x6e, 0x7e, null, null, null, null, 0x6a, null],
            ["ROL", null, 0x26, 0x36, null, 0x2e, 0x3e, null, null, null, null, 0x2a, null],
            ["RTI", null, null, null, null, null, null, null, null, null, null, 0x40, null],
            ["RTS", null, null, null, null, null, null, null, null, null, null, 0x60, null],
            ["SBC", 0xe9, 0xe5, 0xf5, null, 0xed, 0xfd, 0xf9, null, 0xe1, 0xf1, null, null],
            ["STA", null, 0x85, 0x95, null, 0x8d, 0x9d, 0x99, null, 0x81, 0x91, null, null],
            ["TXS", null, null, null, null, null, null, null, null, null, null, 0x9a, null],
            ["TSX", null, null, null, null, null, null, null, null, null, null, 0xba, null],
            ["PHA", null, null, null, null, null, null, null, null, null, null, 0x48, null],
            ["PLA", null, null, null, null, null, null, null, null, null, null, 0x68, null],
            ["PHP", null, null, null, null, null, null, null, null, null, null, 0x08, null],
            ["PLP", null, null, null, null, null, null, null, null, null, null, 0x28, null],
            ["STX", null, 0x86, null, 0x96, 0x8e, null, null, null, null, null, null, null],
            ["STY", null, 0x84, 0x94, null, 0x8c, null, null, null, null, null, null, null],
            ["WDM", 0x42, 0x42, null, null, null, null, null, null, null, null, null, null],
            ["---", null, null, null, null, null, null, null, null, null, null, null, null]
        ];
        this.opcodes = [];
        for (var i = 0; i < this.opcodeLookup.length; i++) {
            this.opcodes.push(this.opcodeLookup[i][0]); //Just the opcode
        }
        this.addressingModes = [
            '#$N',
            '$N',
            '$N,x',
            '$N,y',
            '$L',
            '$L,x',
            '$L,y',
            '($L)',
            '($N,x)',
            '($N),y',
            '',
            '$N',
        ]
        this.labels = {};
        this.error = '';
        this.pc = 0;
    }
    assemble(code) {
        this.error = '';
        this.pc = '';
        if (!code) {
            console.error('Nothing to assemble.');
            this.error = 'Nothing to assemble.'
            return false;
        };
        console.log('Cleaning and Formatting code...')
        var lines = this.sanitize(code)
        var bytes = [];

        console.log('Assembling...');
        for (var i = 0; i < lines.length; i++) {
            //Now that it's formatted the first 3 chars should make up an opcode name
            var opName = lines[i].substring(0, 3).toUpperCase()
            var opCodeNum = this.opcodeLookup.findIndex((value) => {
                return (value[0] == opName)
            }, this)
            var opCode = this.opcodeLookup[opCodeNum]
            console.log(opCode)
            if (!opCode) {
                console.error('Unsupported OpCode at Line ' + i + ':' + opName)
                this.error = 'Unsupported OpCode at Line ' + i + ':' + opName
                return false
            }
            //Replace all the numbers with $N for values under 255 (8 bits or 2 Hexadec digits) and $L for values 256-65535 (2 byte 4 hexadec)
            var value = 0
            var type = ''
            var isSingleByte = undefined
            if ((/(?<=\$)[\da-fA-F]+/g).test(lines[i])) {
                value = parseInt(lines[i].match(/(?<=\$)[\da-fA-F]+/g)[0].toUpperCase(), 16)
                type = 'hexadec'
            } else if ((/\d+/g).test(lines[i])) {
                value = parseInt(lines[i].match(/\d+/g)[0])
                console.log(lines[i].match(/\d+/g))
                type = 'dec'
            }
            console.log(type)
            if (value >= 0 && value < 256) {
                if (type == 'hexadec') {
                    lines[i] = lines[i].replace(/\$[\da-fA-F]+/g, '$N')
                } else if (type == 'dec') {
                    lines[i] = lines[i].replace(/\d+/g, '$N')
                }
                isSingleByte = true
            } else if (value < 65536) {
                if (type == 'hexadec') {
                    lines[i] = lines[i].replace(/\$[\da-fA-F]+/g, '$L')
                } else if (type == 'dec') {
                    lines[i] = lines[i].replace(/\d+/g, '$L')
                }
                isSingleByte = false
            } else {
                console.error('Invalid Value ' + value + ' at line ' + i + '.')
                this.error = 'Invalid Value ' + value + ' at line ' + i + '.'
                return false
            }
            console.log(value)

            //figure out addressing mode
            var info = lines[i].substr(4)
            console.log(info)
            var addrMode = this.addressingModes.findIndex((value) => {
                return info == value
            }) + 1 // <<<<<THERE IS +1 HERE!!!
            console.log(addrMode)

            //figure out bytes
            if ((!opCode[addrMode]) && !(opCodeNum > 3 && opCodeNum < 12)) {//not a branch instruction
                console.error('Addressing Error at Line ' + i + ': Operation ' + opCode[0] + ' does not support that address mode.')
                this.error = 'Addressing Error at Line ' + i + ': Operation ' + opCode[0] + ' does not support that address mode.'
                return false
            }
            if ((opCodeNum > 3) && (opCodeNum < 12)) {//if addressing mode is branch addressing
                if (value.toString(2).length > 8) {
                    console.error('Syntax Error line ' + i + ': Branch too far.')
                    this.error = 'Syntax Error line ' + i + ': Branch too far.'
                    return false
                }
                bytes.push(this.toBinStr(opCode[12], 1))
                bytes.push(this.toBinStr(value, 1))
                continue
            } else {
                bytes.push(this.toBinStr(opCode[addrMode], 1))
            }

            if (addrMode == 11) { //if addressing mode is implied
                continue
            } else if (isSingleByte) {
                bytes.push(this.toBinStr(value, 1))

            } else if (!isSingleByte) {
                var bin = this.toBinStr(value, 2)
                bytes.push(bin.substr(8)) //little Endian
                bytes.push(bin.substr(0, 8))
            }

        }
        console.log(lines)
        console.log(bytes)

        return bytes.join('')
    }
    sanitize(code) {
        var lines = code.split('\n');
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split(';')[0].replace(/^\s+/, "").replace(/\s+$/, "");
        }
        return lines
    }
    toBinStr(num = 0, numofbytes = 1) {
        var o = num.toString(2)
        while (o.length < numofbytes * 8) {
            o = '0' + o
        }
        return o
    }
    disassemble(bytes) {

    }
}

var codeIn = document.getElementById('code')
var output = document.getElementById('output')
var assembleButton = document.getElementById('assembleButton')
var fileIn = document.getElementById('fileIn')
var hexButton = document.getElementById('toggle')
var downloadButton = document.getElementById('download')
var assembler = new Assembler()
var binFile = new BinFile(null, onFileLoad)

assembleButton.addEventListener('click', handleAssembleClick)
function handleAssembleClick() {
    lockButtons();
    var result = assembler.assemble(codeIn.value)
    if (result) {
        output.innerHTML = result
        unlockButtons()
    }
}
fileIn.onclick = startFileLoad
function startFileLoad() {
    binFile.setSourceBlob(fileIn.files[0])
    binFile.r
}

function onFileLoad() {

}

function unlockButtons() {
    downloadButton.disabled = false;
    hexButton.disabled = false;
}

function lockButtons() {
    downloadButton.disabled = true;
    hexButton.disabled = true;
}


/*if ((/=/).test(lines[i])) {
    var nameArray = lines[i].match(/\w+(?= *=)/);//Left side of equals sign without including spaces and anything before
    var valueArray = lines[i].match(/(?<== *)\S+/);//Right sign of equals without including spaces
    if (!nameArray) {
        console.error('Syntax Error: Invalid Label at line '+ (i+1) + '\nLabel name not defined')
        return false
    }
    if (!valueArray) {
        console.error('Syntax Error: Invalid Label at line '+ (i+1) + '\nLabel value not defined')
        return false
    }
    name = nameArray[0];
    var valueString = valueArray[0];



    console.log(name+': '+valueString)
    console.log(valueString)
    if ((!(/[a-zA-Z]/).test(name)) || (this.opcodes.includes(name)) || (this.labels[name])) {
        console.error('Syntax Error: Invalid Label at Line '+(i+1)+'\nLabels reqire at least one letter and do not accept symbols');
        console.log(name)
        return false
    } //Labels can't be opcodes and have to contain at least one letter
    if (typeof parseInt(valueString) == 'undefined') {
        console.error('Syntax Error: Invalid Value at Line '+(i+1)+'\nnumber expected')
        console.log(valueString)
        console.log(typeof valueString)
        return false
    } else {
        var value = parseInt(valueString)
    }
    this.labels[name] = value
}*/