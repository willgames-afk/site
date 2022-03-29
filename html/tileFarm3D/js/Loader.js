import { NearestFilter, TextureLoader } from "../libs/three.module.js"
export class AssetLoader {
	constructor() {
		this.dirtTexture = new TextureLoader().load('./assets/rawTextures/dirt.png');
		this.dirtTexture.magFilter = NearestFilter;
		this.dirtTexture.minFilter = NearestFilter;
	}
}