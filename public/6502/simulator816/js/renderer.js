const { VGADisplay } = require("./ui/display"); //Have to use commonJS syntax, unfortunately.
const { Loader } = require("./loader");
const {LCDDisplay } = require("./ui/lcd")

console.log(`RENDERER LAUNCH (at 0ms)`);

var loadStartTime = Date.now();
var display = null;
var lcd = null;

var loader = new Loader(()=>{
    console.log(`EMULATOR ASSETS LOADED (at ${Date.now() - loadStartTime}ms)`);
    console.log(loader.assets);
    onLoad("assets")
});


window.addEventListener("DOMContentLoaded", function () {
    var parent = document.getElementById("container");
    display = new VGADisplay(parent);
    console.log(`WINDOW LOAD (at ${Date.now() - loadStartTime}ms)`);
	console.log(window)
    onLoad("objects");

	lcd = new LCDDisplay(parent,null,loader)
	loader.start();
})

var windowLoaded = false,
    assetsLoaded = false;
function onLoad(whatLoaded) {
    if (whatLoaded == "objects") {
        if (windowLoaded) {
            console.warn("Assets Onload Triggered Twice!")
        } else {
            windowLoaded = true;
        }
    } else if (whatLoaded == "assets") {
        if (assetsLoaded) {
            console.warn("Assets Onload Triggered Twice!")
        } else {
            assetsLoaded = true;
        }
    }
    if (assetsLoaded && windowLoaded) {
        onFullLoad();
    }
}

function onFullLoad() {
	lcd.init();
	lcd.update();
    console.log(`100% LOADED! (at ${Date.now() - loadStartTime}ms)`);
}