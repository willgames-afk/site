import * as Render from "./modules/rendering.js"
import * as Physics from "./modules/main.js"
import * as Shapes from "./modules/shapes.js"

function start() {
    var canvas = document.getElementById("canvas");
    var engine = new Physics.Engine()
    var renderer = new Render.Renderer(engine,canvas);
    renderer.start();
    
}
window.addEventListener("load",start);