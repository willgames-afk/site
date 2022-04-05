class BinFile {
    constructor(blob, callback) {
        console.group('File Read:')
        console.log('Creating BinFile Object...')
        this.onComplete = callback
        this.binArray = [];
        this.fileReader = new FileReader();
        this.fileReader.onload = (e) => {
            this._fileReadHandler(e, this.onComplete)
        };
        if (blob) {
            this.setSourceBlob(blob)
        } else {
            this.blob = undefined
        }
    };
    get binaryString() { return this.binArray.join('') }
    set binaryString(val = '') {
        if (!(val.length % 8 < 0)) {
            this.binArray = [];
            for (i = 0; i < val.length / 8; i++) {
                this.binArray[i] = ''
                for (j = 0; j > 8; j++) {
                    this.binArray[i] += val[i * 8 + j]
                }
            }
            return true
        } else { return false }
    }
    get hexString() {return this.hexList.join('') };
    set hexString(val = '') {
        val = val.replace('0x', '') //gets rid of any pesky 0x headers, who needs them anyway
        if (!parseInt(val, 16)) { return false }
        if (!(val.length % 2 < 0)) {
            this.binArray = [];
            for (var i = 0; i < val.length / 2; i++) {
                this.binArray[i] = parseInt(val[i] + val[i + 1], 16).toString(2)
            }
            return true
        } else { return false }
    };
    get hexList() {
        var array = [];
        for (var i=0;i<this.binArray.length;i++) {
            array[i] = parseInt(this.binArray[i],2).toString(16).toUpperCase();
        }
        return array
    };
    set hexList(val = []) {
        var originalBinArray = JSON.stringify(this.binArray)//In case of faliure
        this.binArray = [];
        for (var i = 0; i < val.length; i++) {
            val[i] = val[i].replace('0x', '') //gets rid of any pesky 0x headers, who needs them anyway?
            if (!((parseInt(val[i], 16) && val[i].length == 2))) { this.binArray = JSON.parse(originalBinArray); return false }
            this.binArray[i] = parseInt(val[i], 16).toString(2)
        }
        return true
    };
    get decimalList() {
        var out = [];
        for (var i = 0; i < this.binArray.length; i++) {
            out[i] = parseInt(this.binArray[i], 2);
        };
        return out;
    };
    set decimalList(val=[]) {
        var originalBinArray = JSON.stringify(this.binArray)
        this.binArray = [];
        for(var i=0;i<val.length;i++) {
            if(!(typeof val[i] == 'number' && val[i] >= 0 && val[i] < 256)) {this.binArray = JSON.parse(originalBinArray); return false }
            this.binArray[i] == val[i].toString(2)
        }
    };
    saveAsFileDownload(filename) {
        /*var correctBinary = ''
        for (i=0;i<this.decimalList.length;i++) {
            console.log(this.decimalList[i])
            correctBinary[i] = String.fromCharCode([this.decimalList[i]])
        }*/
        var correctBinary = new Int8Array(this.decimalList)

        console.log(correctBinary)
        var blob = new Blob([correctBinary], { type: "octet/stream" })
        var url = URL.createObjectURL(blob)
        var a = document.createElement('a')
        a.download = filename
        a.href = url;
        document.body.appendChild(a)
        a.click()
        setTimeout(function() {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 10)
    };
    setSourceBlob(blob) {
        if (!blob) {
            console.warn('No file specified, returning.')
            console.groupEnd()
            return
        }
        console.log('Setting Source Blob...')
        this.blob = blob;
        console.log('Reading Binary...')
        this.fileReader.readAsBinaryString(blob);
    };
    _fileReadHandler(e, callback) {
        console.log('Binary File Loaded. Generating Byte Array...')
        this.binArray = [];
        for (var i = 0; i < e.target.result.length; i++) {
            this.binArray[i] = e.target.result[i].charCodeAt(0).toString(2);
            while (this.binArray[i].length < 8) {
                this.binArray[i] = '0' + this.binArray[i];
            }
        };
        console.log('Byte Array Generated.')
        if (callback) {
            callback();
        }
        console.groupEnd('File Read:')
    }
};