var c = document.getElementById("maincanvas");

resize();
window.addEventListener("resize", resize);

function load(type, url) {

}



var scale;
function resize() {
	scale = Math.floor(window.innerWidth / 256);
	c.width = 256 * scale;
	c.height = 144 * scale;
}