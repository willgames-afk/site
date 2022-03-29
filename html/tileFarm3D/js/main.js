import * as THREE from "../libs/three.module.js"
import { CameraControls } from "./Player/cameraController.js";
import * as CANNON from "../libs/cannon-es.js"
import { AssetLoader } from "./Loader.js";
import { World } from "./World/generation.js"
import * as Config from "./config.js"


//Central game object
class Game {
	constructor(seed, assets) {

		this.assets = assets;
		this.chunks = {};
		this.loadedChunks = [];
		this.seed = seed;

		//THREE.js Setup
		THREE.Cache.enabled = Config.cacheEnabled;

		this.camera = new THREE.PerspectiveCamera(Config.FOV, window.innerWidth / window.innerHeight, 0.1, 1000); //Create camera

		this.renderer = new THREE.WebGLRenderer();  //Create and size renderer
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		window.addEventListener("resize", this.handleResize.bind(this)); //Add resize handler

		this.scene = new THREE.Scene();

		//Initialize lighting
		this.lighting = {
			sun: new THREE.DirectionalLight("#ffffff", 0.5),   //Sun is top-down directional white light
			antiPitchBlack: new THREE.AmbientLight("#333333") //Amient light to prevent pitch blackness
		}
		this.scene.add(this.lighting.sun, this.lighting.antiPitchBlack);

		this.physics = new CANNON.World({
            gravity: new CANNON.Vec3(0,-9.82,0)// m/s 2
        });

		//Initialize Game World
		this.world = new World(this);
		for (var ix = -8; ix<8;ix++) {
			for (var iz = -8;iz<8;iz++) {
				this.world.loadChunk(ix,iz);
			}
		}

		//Initialize player controller
		this.playerController = new CameraControls(this.camera,document.body)

		//Remove Loading Message
		document.getElementById("loadingmessage").style.display = 'none';

		//Show renderer
		document.body.appendChild(this.renderer.domElement);
	}
	addLoadedChunk(c) {
		this.loadedChunks.push(c);
		this.scene.add(c.mesh)
	}
	handleResize() {
		//Update render size
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		//Update camera aspect ratio
		this.camera.aspect = window.innerWidth/window.innerHeight;
		this.camera.updateProjectionMatrix();
	}
	start() {
		this.camera.translateY(16)
		this.prev = Date.now() - 16.66;
		this.mainLoop();
	}
	mainLoop(now) {
		const dt = (now - this.prev)/ 16.66;
		this.prev = now;
		this.playerController.tick(dt)
		this.renderer.render(this.scene,this.camera);
		requestAnimationFrame(this.mainLoop.bind(this))
	}
}

const assets = new AssetLoader()

const game = new Game(3820863901,assets);
game.start();