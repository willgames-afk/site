import { Point } from "./math.js";
export class Cube {
	constructor(x, y, z, size, texture) {
		this.position = new Point(x, y, z)
		this.size = size;
		this.texture = texture;
		console.log("Cube Texture: ",this.texture)
		this.faces = [
			new SquareFace( //Front face
				this.position,
				this.position.add(0, 0, size),
				this.position.add(0, -size, size),
				this.position.add(0, -size, 0),
				this.texture
			),
			new SquareFace(// Back face
				this.position.add(0,0,size),
				this.position.add(size, 0, size),
				this.position.add(size, -size, size),
				this.position.add(0, -size, size),
				this.texture
			),
			new SquareFace( //Top Face
				this.position,
				this.position.add(size, 0, 0),
				this.position.add(size, 0, size),
				this.position.add(0, 0, size),
				this.texture
			),
			new SquareFace( //Bottom Face
				this.position.add(0, -size, 0),
				this.position.add(0, -size, size),
				this.position.add(size, -size, size),
				this.position.add(0, -size, size),
				this.texture
			),
			new SquareFace( //Left face
				this.position,
				this.position.add(size, 0, 0),
				this.position.add(size, -size, 0),
				this.position.add(0, -size, 0),
				this.texture
			),
			new SquareFace( //Right face
				this.position.add(size, 0, 0),
				this.position.add(size, 0, size),
				this.position.add(size, -size, size),
				this.position.add(size, -size, 0),
				this.texture
			)
		];
	}
	getTriangles() {
		var out = [];
		for (var face of this.faces) {
			out.concat(face.getTriangles());
		}
		console.log(out);
		return out
	}
	getRawPoints() {
		var out = [];
		for (var face of this.faces) {
			out = out.concat(face.getRawPoints());
		}
		return new Float32Array(out);
	}
	getFaceIndices() {
		var out = [];
		for (var i in this.faces) {
			var face = this.faces[i];
			var imod4times4 = (i*4) - (i*4)%4;
			var faceIndices = this.faces[i].getFaceIndices();
			for (var k = 0; k < faceIndices.length; k++) {
				out = out.concat(imod4times4 + faceIndices[k]);
			}
		}
		return new Uint16Array(out);
	}
	getFaceColors() {
		this.color = new Array(4*6).fill(1.0);
	}
}
export class SquareFace {
	constructor(p1, p2, p3, p4, texture, color) {
		this.points = [
			p1,
			p2,
			p3,
			p4
		];
		this.texture = texture;
	}
	getTriangles() { //Returns the coordantes of the 2 triangles that make up the face.
		return [
			this.points[0], this.points[1], this.points[2], //Triangle One 
			this.points[0], this.points[2], this.points[3], //Triangle Two
		]
	}
	getRawPoints() {
		var out = [];
		for (var point of this.points) {
			out = out.concat(point.x, point.y, point.z)
		}
		return out
	}
	getFaceIndices() {
		return [
			0,1,2,
			0,2,3
		]
	}
	getTextureCoords() {
		return this.texture.coords;
	}
}
var t = new Cube(
	0,0,0,
	1,
	"Not A Thing"
)
console.log(t);
console.log(t.getRawPoints());
console.log(t.getFaceIndices())