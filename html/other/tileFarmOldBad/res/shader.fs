varying lowp vec4 vColor;
varying lowp vec2 TexCoord;

uniform sampler2D ourTexture;

void main() {
    gl_FragColor = texture2D(ourTexture, TexCoord);
}