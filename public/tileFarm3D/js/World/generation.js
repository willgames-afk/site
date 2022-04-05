import { SimplexNoise } from "../../libs/simplex-noise.js";
import { Plane, Body, Vec3} from "../../libs/cannon-es.js";
import { Matrix4, PlaneBufferGeometry, Mesh, MeshLambertMaterial, FrontSide, DoubleSide } from "../../libs/three.module.js";
import * as BufferGeoUtils from "../../libs/bufferGeoUtils.js"

const CHUNK_HEIGHT = 256;
const CHUNK_SIZE = 16;

export class World {
	constructor(game) {
		this.game = game;
		this.noise = new SimplexNoise(this.game.seed);
        const HPI = Math.PI/2;
        this.planeInfo = {
            px: [0, HPI,0,  0.5,0,0],
            nx: [0,-HPI,0,  -0.5,0,0],
            py: [-HPI,0,0,  0,0.5,0],
            ny: [ HPI,0,0,  0,-0.5,0],
            pz: [0,0,0,     0,0,0.5],
            nz: [0,0,0,     0,0,-0.5]
        }
        var planeInfo = this.planeInfo;
        this.planes = {}
        for (var plane in planeInfo) {
            const p = planeInfo[plane]
            this.gPlanes[plane] = new PlaneBufferGeometry(1,1);
            this.gPlanes[plane].rotateX(p[0]);
            this.gPlanes[plane].rotateY(p[1]);
            this.gPlanes[plane].rotateZ(p[2]);
            this.gPlanes[plane].translate(p[3],p[4],p[5]);
        }
	}
	loadChunk(x, z) {
		//Loads a specific chunk

		//If chunk has aleady generated, add it to the list of loaded chunks2
		if (this.game.chunks[x + ":" + z]) {
			this.game.addLoadedChunk(this.game.chunks[x + ":" + z]);
		} else {
			const c = this.generateChunk(x, z);
			this.game.chunks[x + ":" + z] = c
			this.game.addLoadedChunk(c);
		}
	}
	generateChunk(x, z) {
		var newChunk = {};
		newChunk.pos = [x, z];
		newChunk.data = [];
		for (var bx = 0; bx < CHUNK_SIZE; bx++) {
			newChunk.data[bx] = [];
			for (var bz = 0; bz < CHUNK_SIZE; bz++) {
				newChunk.data[bx][bz] = [];
				for (var by = 0; by < CHUNK_HEIGHT; by++) {
					newChunk.data[bx][bz][by] = this.isBlock(bx + x * 16, by, bz + z * 16);
				}
			}
		}
		newChunk.mesh = this.generateChunkMesh(newChunk);
		return newChunk;
	}
	isBlock(x, y, z) {
		const smoothness = 50; //How smooth the noise should be
		const groundHeight = (this.noise.noise2D(x / smoothness, z / smoothness) + 1) * 10; //Generates a random block height from 0 to 20;

		return y < groundHeight; //If the block is 'underground', then it's a solid block
	}
	generateChunkMesh(chunk) {
		//console.log(chunk)

		var faces = [];
		var position = new Matrix4();

		function addFace(axis, posOrNeg) {
			//To faces: add a copy of the correctly-facing plane positioned properly
			faces.push(this.planes[posOrNeg + axis].clone().applyMatrix4(position));
            var physicsPlane = new Body({mass: 0, shape: new Plane()});
            const p = this.
            physicsPlane.quaternion.setFromEuler(p[0],p[1],p[2]);
            physicsPlane.position.set(p[3],p[4],p[5])
		}

        addFace = addFace.bind(this)


		//Generate planes here
		for (var bx = 0; bx < CHUNK_SIZE; bx++) {
			for (var bz = 0; bz < CHUNK_SIZE; bz++) {
				for (var by = 0; by < CHUNK_HEIGHT; by++) {
					position.makeTranslation(bx, by, bz); //Make the position matrix into the correct translation matrix

					if (chunk.data[bx] && chunk.data[bx][bz] && chunk.data[bx][bz][by]) {
						if (bx == 0) {
							if (!this.isBlock(chunk.pos[0] * 16 - 1, by, chunk.pos[1] * 16 + bz)) addFace("x","n")
						} else if (!chunk.data[bx - 1][bz][by]) {
							addFace("x","n")
						}
						if (bz == 0) {
							if (!this.isBlock(chunk.pos[0] * 16 + bx, by, chunk.pos[1] * 16 - 1)) addFace("z","n")
						} else if (!chunk.data[bx][bz - 1]?.[by]) {
							addFace("z","n")
						}

						if (!chunk.data[bx][bz][by - 1]) {
							addFace("y","n")
						}

						if (bx == CHUNK_SIZE - 1) {
							if (!this.isBlock((chunk.pos[0] + 1) * 16, by, chunk.pos[1] * 16 + bz)) addFace("x","p")
						} else if (!chunk.data[bx + 1][bz][by]) {
							addFace("x","p")
						}
						if (bz == CHUNK_SIZE - 1) {
							if (!this.isBlock(chunk.pos[0] * 16 + bx, by, (chunk.pos[1] + 1) * 16)) addFace("z","p")
						} else if (!chunk.data[bx][bz + 1]?.[by]) {
							addFace("z","p")
						}

						if (!chunk.data[bx][bz][by + 1]) {
							addFace("y","p")
						}
					}
				}
			}
		}
		//console.log(faces)
		//Merge all the planes together into one geometry
		var geo = BufferGeoUtils.mergeBufferGeometries(faces);
		var mesh = new Mesh(geo, new MeshLambertMaterial({ map: this.game.assets.dirtTexture, side: FrontSide }));
		mesh.translateX(chunk.pos[0] * 16);
		mesh.translateZ(chunk.pos[1] * 16);
		//this.game.physics.add(mesh);
		return mesh
	}
}