console.groupCollapsed('Initializing NOPs:');
var num = document.getElementById('numberofnops');
var blob = new Blob();
var binary = new BinFile(blob);
function createNOP() {
    var array = [];
    var value = num.value;
    if (!value) {alert("Sorry, but the number you entered actually isn't a number.");num.value = 0; return false}
    if (value > 65536) {alert("Sorry, but the number you entered is too big to fit in the 6502's address space.");num.value = 0; return false}
    for (i=0;i<value;i++) {
        array[i] = 'EA'
    }
    console.log(array)
    binary.hexList = array
    if (confirm("You're about to download a file called noprom.bin that contains "+value+" 6502 No Operation Instructions. Is that okay?")) {
        console.log('started')
        binary.saveAsFileDownload('noprom.bin')
        console.log('done')
    }
}
console.groupEnd('Initializing NOPs:');