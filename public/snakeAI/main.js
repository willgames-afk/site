import { Pathfinder } from "./findpath.js";

let gridSize = [10,10]
let snakePoints = [];
let fruitCoords = [];

var p = new Pathfinder(gridSize, snakePoints);
console.log(p.findPath([0,0],[10,10]));