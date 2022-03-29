console.groupCollapsed('Initializing BinViewer:')
var binFile = new BinFile()
var file = document.getElementById('fileIn');
var out = document.getElementById('out');
var toggleButton = document.getElementById('toggle');
var hexMode = false;
binFile.onComplete = whenload

function processFile() {
    binFile.setSourceBlob(file.files[0])
}
function whenload() {
    console.log('Displaying...')
    if (hexMode) {
        out.value = binFile.hexString
    } else {
        out.value = binFile.binaryString
    }
    console.log('Done!')
}
function downloadFile() {
    binFile.saveAsFileDownload(prompt('Please enter a filename below.'))
}
function toggleHexMode() {
    hexMode = !hexMode;
    if (toggleButton.value == 'View in Hexadecimal') {
        toggleButton.value = 'View in Binary';
        console.log(binFile.hexString)
        out.value = binFile.hexString
    } else {
        toggleButton.value = 'View in Hexadecimal';
        out.value = binFile.binaryString
    };
};
console.groupEnd()