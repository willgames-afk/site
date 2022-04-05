
export class Display {
	constructor(parentElement, width, height, style) {

		//Canvas Setup
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
		parentElement.appendChild(this.canvas);

		//WebGL creation
		this.renderingContext = this.canvas.getContext("webgl");
		if (this.renderingContext === null) {
			throw "WebGL Not Initialized; Cannot continue.";
		}

		console.log("%cSuccessful Display init!", "color: 7f7;");

		console.log("Display: ", this);

	}
	get width() {
		return this.canvas.width;
	}
	set width(v) {
		this.canvas.width = v;
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}
	set height(v) {
		this.canvas.height = v;
		return this.canvas.height;
	}
}

export class Shader {
	constructor(gl, vsSource, fsSource) {
		this.gl = gl; //WebGL instance
		this.vsSource = vsSource; //Vertex Shader Source Code
		this.fsSource = fsSource; //Fragment Shader Source Code

		function loadShader(type, source) {
			//Make shader
			const shader = this.gl.createShader(type);
			this.gl.shaderSource(shader, source);
			this.gl.compileShader(shader);
			//Handle errors
			if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
				error("LoadShader Errror: An error occured compiling the shader. Info: " + this.gl.getShaderInfoLog(shader));
				this.gl.deleteShader(shader);
				return null;
			}
			return shader
		}

		//Create vertex and fragment shaders
		this.vertexShader = loadShader.bind(this)(this.gl.VERTEX_SHADER, this.vsSource);
		this.fragmentShader = loadShader.bind(this)(this.gl.FRAGMENT_SHADER, this.fsSource);

		//Link them into a shader program
		this.shader = this.gl.createProgram();
		this.gl.attachShader(this.shader, this.vertexShader);
		this.gl.attachShader(this.shader, this.fragmentShader);
		this.gl.linkProgram(this.shader);

		//Error Handling
		if (!this.gl.getProgramParameter(this.shader, this.gl.LINK_STATUS)) {
			error('LoadShader Error: Unable to initialize the shader program. Info: ' + this.gl.getProgramInfoLog(shaderProgram));
			return null;
		}


		this.info = { program: this.shader };
	}
}
export class Rendererer {
	constructor(display, gameState, assets) {
		this.display = display;
		this.gameState = gameState;
		this.assets = assets;
		console.log(assets)
		this.gl = this.display.renderingContext; //WebGL instance

		this.initShaders()
		this.initBuffers();
	}
	initShaders() {
		//Create shader
		this.shader = this.assets.shaders.shader
	}
	initBuffers() {

		const obj = this.gameState.objects[0];

		const positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, obj.getRawPoints(), this.gl.STATIC_DRAW);

		//Face colors of the cube
		const faceColors = [
			[1.0, 1.0, 1.0, 1.0],    // Front face: white
			[1.0, 0.0, 0.0, 1.0],    // Back face: red
			[0.0, 1.0, 0.0, 1.0],    // Top face: green
			[0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
			[1.0, 1.0, 0.0, 1.0],    // Right face: yellow
			[1.0, 0.0, 1.0, 1.0],    // Left face: purple	
			//[1.0, 0.0, 1.0, 1.0],    // Left face: purple
		];
		var colors = [];
		for (var j = 0; j < faceColors.length; j++) {
			const c = faceColors[j];
			//Repeat each color 4 times (WebGL colors by vertex and each face has 4 vertexes)
			colors = colors.concat(c, c, c, c);
		}

		//Set up WebGL buffer
		const colorBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);

		const ct = obj.texture
		console.log(ct)
		//texture all sides of the cube
		var txcoords = [
		]
		for (var tx in ct) {
			txcoords = txcoords.concat(ct[tx].coords);
		}
		console.log(new Float32Array(txcoords))

		//Set up webgl buffer
		const txcoordbuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, txcoordbuffer)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(txcoords), this.gl.STATIC_DRAW);

		//Point indices
		const indexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, obj.getFaceIndices(), this.gl.STATIC_DRAW)

		this.buffers = {
			position: positionBuffer,
			color: colorBuffer,
			indices: indexBuffer,
			texture: txcoordbuffer,
			indicesLength: obj.getFaceIndices().length,
		}
	}
	render() {

		this.gl.clearColor(0.0, 0.0, 0.0, 1.0); //Background color clear black
		this.gl.clearDepth(1.0);               //Clear all
		this.gl.enable(this.gl.DEPTH_TEST);        //Enable depth testing
		this.gl.depthFunc(this.gl.LEQUAL);        //Near things block far things


		//Clear Canvas
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		//Create perspective matrix
		const fov = 45 * Math.PI / 180;                                      //Field of view (In Radians)
		const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight; //Aspect ration of canvas;
		const zNear = 0.1;   //Only display objects between .1 and 
		const zFar = 100.0;  //   100 units from the camera
		const projectionMatrix = mat4.create();
		mat4.perspective(
			projectionMatrix,
			fov,
			aspect,
			zNear,
			zFar
		);

		//set draw position to identity point (Center of scene)
		var modelViewMatrix = mat4.create();
		mat4.lookAt(
			modelViewMatrix,//Matrix to operate on
			this.gameState.player.pos, //Player Position
			vec3.add(vec3.create(), this.gameState.player.pos, this.gameState.player.direction), //LookingAt
			vec3.fromValues(0, 1, 0)
		)

		/*Move the draw position a bit to where we want to draw the square
		mat4.translate(
			modelViewMatrix, //Destination
			modelViewMatrix, //Matrix to tranlate
			[0.0, 0.0, -6.0] //Amount to tranlate
		)*/
		mat4.rotate(
			modelViewMatrix,
			modelViewMatrix,
			this.gameState.rotation,
			[0, 0, 1]
		)
		mat4.rotate( //Rotate cube around x axis too
			modelViewMatrix,
			modelViewMatrix,
			this.gameState.rotation * 0.7,
			[0, 1, 0] //Only x axis
		);

		//Tell webgl how to get the positions from the position buffer into the vertexPosition attribute	
		{
			const componentCount = 3; //Pull 3 values per iteration (x y and z)
			const type = this.gl.FLOAT; //The buffer is in 32 bit floats
			const normalize = false; //don't normalize
			const stride = false;// how many bytes to get from one set of values to the next, 0=use type & componentCount above.
			const offset = 0;     //how many bytes inside the buffer to start from
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
			this.gl.vertexAttribPointer(
				this.shader.info.attribLocations.vertexPosition,
				componentCount,
				type,
				normalize,
				stride,
				offset
			)
			this.gl.enableVertexAttribArray(
				this.shader.info.attribLocations.vertexPosition
			);
		}

		{
			const componentCount = 2; //Pull 3 values per iteration (x y and z)
			const type = this.gl.FLOAT; //The buffer is in 32 bit floats
			const normalize = false; //don't normalize
			const stride = false;// how many bytes to get from one set of values to the next, 0=use type & componentCount above.
			const offset = 0;     //how many bytes inside the buffer to start from
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texture);
			this.gl.vertexAttribPointer(
				this.shader.info.attribLocations.texCoord,
				componentCount,
				type,
				normalize,
				stride,
				offset
			)
			this.gl.enableVertexAttribArray(
				this.shader.info.attribLocations.texCoord
			);
		}

		//How to get color from color buffer to vertexColor
		//A guide for webgl
		{
			const componentCount = 4; //Pull 4 values per iteration (rgba)
			const type = this.gl.FLOAT; //The buffer is in 32 bit floats
			const normalize = false; //don't normalize
			const stride = 0;// how many bytes to get from one set of values to the next, 0=use type & componentCount above.
			const offset = 0;     //how many bytes inside the buffer to start from
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
			this.gl.vertexAttribPointer(
				this.shader.info.attribLocations.vertexColor,
				componentCount,
				type,
				normalize,
				stride,
				offset
			)
			this.gl.enableVertexAttribArray(
				this.shader.info.attribLocations.vertexColor
			);
		}


		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);



		//Tell webgl to use our shader program
		this.gl.useProgram(this.shader.shader);

		const texture = this.assets.textures.cubeTexture;
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.front.texture)
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.back.texture)
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.top.texture)
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.bottom.texture)
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.left.texture)
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.right.texture)


		//Set shader uniforms
		this.gl.uniformMatrix4fv(
			this.shader.info.uniformLocations.projectionMatrix,
			false,
			projectionMatrix
		)
		this.gl.uniformMatrix4fv(
			this.shader.info.uniformLocations.modelViewMatrix,
			false,
			modelViewMatrix
		)

		{
			const vertexCount = this.buffers.indicesLength;
			const type = this.gl.UNSIGNED_SHORT;
			const offset = 0;
			this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
		}
	}
	addFace(x, y, z, dir, texture) {
		if (dir == "north") {

		} else if (dir == "south") {

		} else if (dir == "west") {

		} else if (dir == "east") {

		} else if (dir == "up") {

		} else if (dir == "down") {

		}
	}
}