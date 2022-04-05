
import { isPowerOf2 } from "./math.js";
import { Shader } from "./graphics.js";


export class ResourceManager {
	constructor(gl, gs, requiredResources) {
		this.gl = gl; //WebGL context, for loading shaders, textures, etc
		//this.gs = gs; //Game State
		this.res = {
			textures: {

			},
			shaders: {

			}
		}
		this.requiredResources = requiredResources;
		this.leftToLoad = this.requiredResources;
		this.leftToLoad = this.leftToLoad;
	}
	start() {
		for (var i = 0; i < this.requiredResources.length; i++) {
			this.loadResource(this.requiredResources[i], this._checkifcomplete.bind(this))
		}
	}
	onCompleteLoad() { //Placeholder

	}
	_checkifcomplete(name) {
		console.log(`Asset "${name}" Loaded!`);
		this.leftToLoad.splice(this.leftToLoad.indexOf(name), 1);
		if (this.leftToLoad.length === 0) {
			//Everythink is loaded; clean up some stuff
			for (var tex in this.res.textures) { //Define top bottom left and rights for blocks when only "all" or "sides" are defined
				if (this.res.textures[tex].all) {
					const all = this.res.textures[tex].all;
					this.res.textures[tex].top = all;
					this.res.textures[tex].bottom = all;
					this.res.textures[tex].left = all;
					this.res.textures[tex].right = all;
					this.res.textures[tex].front = all;
					this.res.textures[tex].back = all;
					delete this.res.textures[tex].all;
				}
				if (this.res.textures[tex].sides) { //"sides" will override "all"
					const sides = this.res.textures[tex].sides;
					this.res.textures[tex].left = sides;
					this.res.textures[tex].right = sides;
					this.res.textures[tex].front = sides;
					this.res.textures[tex].back = sides;
					delete this.res.textures[tex].sides;
				}
			}

			this.onCompleteLoad();
		}
	}
	loadResource(name, onload) {
		//Loads a resource. Looks in the res folder for a json file with the name probided by the name parmeter
		// and looks inside to figure out the details.

		var xhr = new XMLHttpRequest(); //Set up XML Http Request

		function orsc(onload) { //On ready state change

			if (xhr.readyState === XMLHttpRequest.DONE) { //If done

				if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 400)) { //If successful

					//Parse describer json
					var resObj = JSON.parse(xhr.responseText);

					if (resObj.type == "texture") {
						//Initialize
						this.res.textures[name] = {};
						for (var key in resObj.faceTextures) { //For each face texture

							this.res.textures[name][key] = {}; //Create subtexture
							this.res.textures[name][key].texture = this.loadTexture( //Load the texture
								this.gl,
								resObj.srcFiles[resObj.faceTextures[key].img], //Find src name
								resObj.faceTextures[key], //Options for texture loader
								onload.bind(this, name) //Callback
							);
							this.res.textures[name][key].coords = resObj.faceTextures[key].coords;
						}
					
					} else if (resObj.type == "shader") {

						//initialize
						this.res.shaders[name] = {};

						function onshaderload(shader) {
							this.res.shaders[name] = shader;
							this.res.shaders[name].info.attribLocations = {
								vertexPosition: this.gl.getAttribLocation(shader.shader, resObj.attributes.vertexPosition),
								vertexColor: this.gl.getAttribLocation(shader.shader, resObj.attributes.vertexColor),
								textureCoordanate: this.gl.getAttribLocation(shader.shader, resObj.attributes.textureCoordanate)
							}
							this.res.shaders[name].info.uniformLocations = {
								projectionMatrix: this.gl.getUniformLocation(shader.shader, resObj.uniforms.projectionMatrix),
								modelViewMatrix: this.gl.getUniformLocation(shader.shader, resObj.uniforms.viewMatrix),
							}
							onload(name)
						}
						this.loadShader(this.gl, "res/" + resObj.srcFiles.vert, "res/" + resObj.srcFiles.frag, onshaderload.bind(this));
					}
					
				}
			}
		}
		xhr.onreadystatechange = orsc.bind(this, onload);
		xhr.open("GET", "res/" + name + ".json");
		xhr.send();
	}
	loadTexture(gl, url, options, whenload) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		//Images have to load, so put a single pixel so the texture can be used.
		//We'll replace it once the image loads.
		const level = 0;
		const internalFormat = gl.RGBA;
		const width = 1;
		const height = 1;
		const border = 0;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		const pixel = new Uint8Array([0, 255, 0, 255]); //Opaque Green
		gl.texImage2D(
			gl.TEXTURE_2D,
			level,
			internalFormat,
			width,
			height,
			border,
			srcFormat,
			srcType,
			pixel
		);

		//Load the actual texture
		const image = new Image();
		image.onload = function () {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(
				gl.TEXTURE_2D,
				level,
				internalFormat,
				srcFormat,
				srcType,
				image
			)

			//WebGL is wierd about power of 2 images; it needs mipmaps.
			if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
				gl.generateMipmap(gl.TEXTURE_2D);
			} else {
				//No mipmaps, clamp to edge and prevents wrapping (repeating)
				if (options.wrappingX) {
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[options.wrappingX]);
				} else {
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[options.wrapping]);
				}

				if (options.wrappingY) {
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[options.wrappingY]);
				} else {
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[options.wrapping]);
				}

				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[options.filter]);


			}
			whenload();
		}
		image.src = "res/" + url; //Start it loading

		return texture;
	}
	loadShader(gl, vsURL, fsURL, onload) {
		var vsSource = "";
		var fsSource = "";
		function checkIfBothLoaded() {
			if (vsSource != "" && fsSource != "") {
				//Continue
				onload(new Shader(gl, vsSource, fsSource));
			}
		}
		this.requestFile(vsURL, function (file) {
			vsSource = file;
			checkIfBothLoaded();
		}.bind(this), "");
		this.requestFile(fsURL, function (file) {
			fsSource = file;
			checkIfBothLoaded();
		}, "");
	}
	requestFile(url, onload, type, id) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 400)) {
					if (xhr.responseType !== type) {
						console.error("LoadError: File Type " + xhr.responseType + " does not equal paramter type: " + type)
					} else {
						onload(xhr.response, id);
					}
				} else {
					console.error("LoadError: XMLHttpRequest Failed to load resource, returned status code " + xhr.status + ".");
				}
			}
		}
		xhr.open("GET", url);
		xhr.send();
	}
}