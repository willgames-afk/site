var detectKeys = false
window.addEventListener('keydown', log)
button = document.getElementById('keydetectortoggle')
function toggleKeyDetector() {
    detectKeys = !detectKeys
    if (button.innerHTML == 'Activate') {
        button.innerHTML = 'Deactivate';
    } else {
        button.innerHTML = 'Activate';
    }
}
function log(e) {
    if (detectKeys) {
        console.log(e)
    }
}