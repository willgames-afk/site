attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

varying highp vec2 TexCoord;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	vColor = aVertexColor;
	TexCoord = aTexCoord;
}