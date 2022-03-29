//NOT JAVASCRIPT, USING IT TO GET COMMENTS IN JSON.

//--------------------------TEXTURE EXAMPLE-------------------------//
var _ = {
	"type" : "texture", //What kind of resource the file is
	"srcFiles": { //Contains the urls all the raw resources (images and such) to be refrerenced 
		"referenceName": "/path/to/image.extention", // Throughout the json
		"secondImage": "/different/path/to/image.extention"
	},
	"faceTextures": {/*
		valid properties:

		all (all faces)
		sides (All faces except the top and bottom)
		top, bottom, left(-x), right(+x), front (+z), back (-z)
*/		"all": {
			"img": "referenceName", //The name you put up at textureSrcs ^^
			"coords": [
				0.0, 0.0, //0 corrosponds to the first pixel, 1 corosponds to the last pixel,
				1.0, 0.0, //A UV mapping of texture coords to plane points (the first array element being the top left point,
				1.0, 1.0, //The next being the top right, the then the bottom right, then the bottom left.
				0.0, 1.0
			],
			"wrappingX" : "CLAMP_TO_EDGE",/*
				Describes what WebGL should do if a coord outside the range of 0 to 1
				is given.

				Valid Properties:
				REPEAT - Repeats the texture
				MIRRORED_REPEAT - repeats the texture, but flips it every other repeat
				CLAMP_TO_EDGE - It will clamp the coord to the edge, repeating the pixels on the edge of the texture
				CLAMP_TO_BORDER - Not Supported!!
				
*/
			"wrappingY": "value",//Same properties as wrappingX just in the y direction
			//----- OR---------//
			"wrapping": "value",//Sets both wrappingX and wrappingY to the value

			"filter": "LINEAR_MIPMAP_LINEAR",/*
				When scaling textures pixels don't exactly match up. This describes how
				WebGL should deal with that.

				Valid Values:
				NEAREST: grabs the nearest pixel. Can result in pixelated images, which can be a good thing.
				LINEAR: Returns a weighted average of the 4 pixels surrounding the coord. Looks smoother but takes more resources.
				(NEAREST or LINEAR)_MIPMAP_(NEAREST or LINEAR): MipMaps are smaller copies of the texture, nearest and linear apply similarly here.

				*/
			"filter-mag": "LINEAR",//Only when upscaling (magnifying) textures
			"filter-min": "LINEAR" //Only when downscaling (minifying) textures
		}
	}
}
_={
	"type" : "shader", //Identifies the resource as a shader
	"srcFiles": {
		//Must contain fragmentShader and vertexShader
		"fragmentShader" : "adsfadf.fs",
		"vertexShader" : "adasdfawx.vs"
	},
	"attributes" : { 
		"vertexPosition": "variable refecenced in shader that the vertexPosition var will be passed to",
		"vertexColor": "aVertexColor",
		"textureCoordanate": "aTexCoord"
	},
	"uniforms" : {
		"viewMatrix": "uModelViewMatrix",
		"projectionMatrix": "uProjectionMatrix"
	}
}