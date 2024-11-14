import * as M from "./m2.js"
import { Vec2 } from "./m2.js"
class Road {
	constructor(a,b,lanes){
		this.a = a;
		this.b = b;
		this.lanes=lanes || [];
	}
	isOutgoing(laneId, nodeId) {
		if (nodeId != this.b && nodeId != this.a) {
			//Neither incoming nor outgoing; wrong node.
			return null;
		}
		let isBNode = false;
		if (nodeId == this.b) {
			isBNode = true;
		}
		let n = this.lanes[laneId].name
		if (n == "a") {
			return isBNode;
		} else if (n == "b") {
			return !isBNode;
		} else {
			return null;
		}
	}
}

class Node {
	constructor(p,roads) {
		this.pos = p;
		this.roads = roads || []
	}
	getOutLaneOptions(net, nodeId, inRoadId, inLaneId) {
		let outlanes = [];
		for (let roadID of this.roads) {
			if (roadID == inRoadId) continue; //TODO: This outlaws U-turns...
			let road = net.edges[roadID];
			for (let i=0;i<road.lanes.length;i++) {
				let res = road.isOutgoing(i,nodeId);
				if (res === true) {
					outlanes.push([roadID, i]);
				}
			}
		}
		return outlanes;
	}
}

const roadLanes = "ab"
const laneWidth = 20;
const laneEdge = 5;
const carLength = 27;
const carWidth = 15;

const checkRadius = carLength * 1.5;
const stopRadius = carLength * 1.05;
/*
Lanes:
a = lane goes from B to A
b = lane goes from A to B
o = gap
*/

class Vehicle {
	constructor(p,r) {
		this.pos = p;
		this.t = 0;
		this.col = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`
		this.nextRoad = null;
		this.nextLane = null;
	}
	updatePos(p1,p2,dt) {
		this.t += dt * 100 / p2.sub(p1).len();
		if (this.t > 1) this.t = 1;
		this.pos = Vec2.lerp(p1,p2,this.t);
		if (this.t >= 1) return true;
		return false;
	}
}

function getNextLane(net, roadID, laneID) {
	let road = net.edges[roadID];
	let lane = road.lanes[laneID];
	let p2;
	if (lane.name == "b") {
		p2 = road.b
	} else if (lane.name == "a") {
		p2 = road.a
	} else {
		console.assert(false, "Get next lane only works for normal A and B lanes!");
	}
	let options = net.nodes[p2].getOutLaneOptions(net,p2,roadID,laneID)
	let newLaneIndex = Math.floor(Math.random() * options.length)
	return options[newLaneIndex];
}

class Network {
	constructor() {
		this.nodes = [];
		this.edges = [];
		this.vehicles = [];
	}
	node(n) {
		this.nodes.push(new Node(n, []));
		return this.nodes.length - 1;
	}
	extend(i, n, l){
		this.edges.push(new Road(i, this.nodes.length, l));
		this.nodes.push(new Node(n,[this.edges.length - 1]));
		this.nodes[i].roads.push(this.edges.length - 1); //TODO: run some sort of callback to "fix up" nodes after adding a new road to them?
		return this.nodes.length - 1;
	}
	connect(i1,i2, l){
		this.nodes[i1].roads.push(this.edges.length);
		this.nodes[i2].roads.push(this.edges.length); //TODO: run some sort of callback to "fix up" nodes after adding a new road to them?
		this.edges.push(new Road(i1, i2, l));
	}
	draw(ctx){
		for(let road of this.edges) {
			var offs = 0;
			let a = this.nodes[road.a].pos;
			let b = this.nodes[road.b].pos;
			var i =0;
			const roadTan = b.sub(a).normalize();
			while(i < road.lanes.length) {
				var w = 0;
				while (i < road.lanes.length && roadLanes.includes(road.lanes[i].name)) {
					w++;
					i++;
				}
				i++;
				//console.log(i);
				let hoffs = -(road.lanes.length/2 - offs - w/2) * laneWidth;
				ctx.lineWidth = w * laneWidth + laneEdge*2;
				offs += w + 1;
				let offsVector = roadTan.normal().scale(hoffs);
				let offsA = a.add(offsVector);
				let offsB = b.add(offsVector);
				ctx.beginPath();
				ctx.moveTo(offsA.x, offsA.y);
				ctx.lineTo(offsB.x,offsB.y);
				ctx.strokeStyle = "#000"
				ctx.stroke();
			}
		}
		for (let road of this.edges) {
			let a = this.nodes[road.a].pos;
			let b = this.nodes[road.b].pos;
			const roadTan = b.sub(a).normalize();
			for (let i=0;i<road.lanes.length;i++) {
				let lane = road.lanes[i];
				//let offs = roadTanget.normal().scale(road.lanes.length/2 - i)
				if (!lane.cars) continue;
				for (let car of lane.cars) {
					//console.log(car);
					let start = car.pos.sub(roadTan.scale(carLength/2));
					let end = car.pos.add(roadTan.scale(carLength/2));
					ctx.beginPath();
					ctx.lineWidth = carWidth;
					ctx.strokeStyle = car.col;
					ctx.beginPath();
					ctx.moveTo(start.x,start.y);
					ctx.lineTo(end.x,end.y);
					ctx.stroke();
					//let newPos = Vec2.lerp(a.add(offs),b.add(offs),car.progress);
				}
			}
		}
		for (let node of this.nodes) {
			ctx.fillStyle = "green";
			ctx.beginPath();
			ctx.arc(node.pos.x,node.pos.y,10,0,Math.PI*2);
			ctx.fill();
		}
	}
}

let test = true;
if (test) {
	M.testIntersect();
}

const normalRoad = ()=>[{name:"b", cars:[]},{name:"a",cars:[]}]//,{name:"a", cars:[]},{name:"o"},{name:"b",cars:[]}]
const r2laneRoad = ()=>[{name:"b",cars:[]},{name:"b",cars:[]}]

let testNet = new Network()
testNet.node(new Vec2(50,50));
testNet.extend(0,new Vec2(200,50), r2laneRoad())
testNet.extend(1,new Vec2(200,200), r2laneRoad())
testNet.extend(2,new Vec2(50,200), normalRoad())
testNet.connect(3,0,normalRoad())
testNet.extend(3,new Vec2(50,600), normalRoad())
testNet.extend(4, new Vec2(400,200),normalRoad())
testNet.extend(5,new Vec2(400,50), normalRoad())
testNet.connect(6,1,normalRoad());
//testNet.vehicles.push()
//testNet.edges[0].lanes[0].cars = [new Vehicle(new Vec2(20,20))]

spawnCar(testNet,0,0);
//spawnCar(testNet,0,0)

function spawnCar(net, roadID, laneID) {
	let road = net.edges[roadID];
	let a = net.nodes[road.a].pos;
	let b = net.nodes[road.b].pos;
	const roadTan = b.sub(a).normalize();
	let lane = road.lanes[laneID];
	//let direction = road.tangent();
	let position = a;
	let targetID = road.b;
	if (lane.name == 'a') {
		//direction = new Vec2(0,0).sub(direction);
		position = b;
		targetID = road.a;
	}
	let offs = (-road.lanes.length/2 + laneID + 0.5) * laneWidth;
	let realPos = position.add(roadTan.normal().scale(offs)) 
	net.edges[roadID].lanes[laneID].cars.push(new Vehicle(realPos));
	//Figure out which lane to take after this one
	let nextLaneInfo = getNextLane(net,roadID,laneID);
	net.edges[roadID].lanes[laneID].cars[net.edges[roadID].lanes[laneID].cars.length-1].nextRoad = nextLaneInfo[0];
	net.edges[roadID].lanes[laneID].cars[net.edges[roadID].lanes[laneID].cars.length-1].nextLane = nextLaneInfo[1];
}

function updateCars(net,dt) {
	for (let roadID =0;roadID<net.edges.length;roadID++) {
		let road = net.edges[roadID];
		let a = net.nodes[road.a];
		let b = net.nodes[road.b];
		const roadTan = b.pos.sub(a.pos).normalize();
		for(let i=0;i<road.lanes.length;i++) {
			let lane = road.lanes[i];
			let offs = roadTan.normal().scale((-road.lanes.length/2 + i + 0.5) * laneWidth);
			let a1 = a;
			let b1 = b;
			let a1i = road.a;
			let b1i = road.b;
			if (lane.name == "a") {
				a1 = b;
				b1 = a;
				a1i = road.b;
				b1i = road.a;
			}
			let startPos = a1.pos.add(offs);
			let endPos = b1.pos.add(offs);
			if (!lane.cars) continue;
			for(let carID = 0;carID<lane.cars.length;carID++) {
				let car = lane.cars[carID];
				function collide() {
					let foundClose = false;
					for (let road2ID in net.edges) {
						let road2 = net.edges[road2ID];
						for (let lane2ID in road2.lanes) {
							let lane2 = road2.lanes[lane2ID];
							for (let car2ID in lane2.cars) {
								if (car2ID == carID
									&& lane2ID == i
									&& road2ID == roadID
								) continue;
								let car2 = lane2.cars[car2ID];
								let distVec = car2.pos.sub(car.pos);
								let distSquared = distVec.dot(distVec);
								if (distSquared > checkRadius * checkRadius) {
									continue;
								}
								let mightBeReallyClose = false;
								if (distSquared < stopRadius * stopRadius) {
									mightBeReallyClose = true; 
								}
								let carDirection = endPos.sub(startPos).normalize();
								let action = distVec.normalize().dot(carDirection)/(carDirection.dot(carDirection)); //This is the first part of mapping distVec onto carDirection
								if (action <= 0) { // If car that is too close is behind us, don't do anything
									continue;
								}
								if (action > 0.9) {
									if (mightBeReallyClose) {
										return "really close"
									}
									foundClose = true;
								}	
							}
						}
					}
					return foundClose;
				}
				let close = collide()
				if (close == "really close") continue;
				let speed = dt;
				if (close) speed/=2;
				/*if (car.nextLane && car.nextRoad) {
					if (collide(net.edges[car.nextRoad].lanes[car.nextLane])) continue;
				}*/
				if (car.updatePos(startPos,endPos,speed)) {
					let newLane = [car.nextRoad,car.nextLane];//getNextLane(net,b1,b1i,roadID,i)
					lane.cars.splice(carID,1);
					car.t = 0;

					if (newLane[0] === null || newLane[1] === null) {
						continue; //Delete the car
					}

					let nextlane = getNextLane(net,newLane[0],newLane[1]);

					net.edges[newLane[0]].lanes[newLane[1]].cars.push(car);

					if (nextlane === undefined) {
						nextlane = [null,null];
					}
					[car.nextRoad,car.nextLane] = nextlane;

				}
			}
		}
	}
}

function setSize(c) {
	c.width = window.innerWidth - 1;
	c.height = window.innerHeight - 1;
}

let c = document.createElement("canvas");
c.style.display = "block";
setSize(c);
let cx = c.getContext('2d');
function redraw() {
	cx.fillStyle = "#FFF";
	cx.fillRect(0,0,c.width,c.height);
	testNet.draw(cx);
}
var prevTime = performance.now();
var framecounter = 0;
function mloop(newTime) {
	const dt = (newTime - prevTime) / 1000;
	prevTime = newTime;
	updateCars(testNet, dt);
	redraw();
	framecounter += dt;
	if (framecounter >= 1) {
		framecounter = 0;
		spawnCar(testNet,0,0);
	}
	requestAnimationFrame(mloop);
}

addEventListener("load",()=>{
	document.body.appendChild(c);
	redraw();
	requestAnimationFrame(mloop)
})
addEventListener("resize",()=>{
	setSize(c);
	redraw();
})