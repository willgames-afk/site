const { readFile } = require("fs");
const path = require("path");

const config = {
	basePath: "./assets"
}

function toArrayBuffer(buf) {
	return Uint8Array.from(buf).buffer;
}

class Loader {
	constructor(onload, basePath) {
		this.onload = onload
		this.assets = {};
		this.toLoad = [];
		this.filesLeft = 0;
		this.started = false;
	}

	start() {
		if (this.started) {
			console.warn("Loader already started!");
			return
		}
		this.filesLeft = this.toLoad.length;
		for (var i = 0; i < this.toLoad.length; i++) {

			const d = this.toLoad[i]
			console.log(`Loading From Info: ${JSON.stringify(d,null,"	")}`)

			if (d.options && d.options.type) {
				if (d.options.type == "img") {
					//Images load differently
					this.assets[d.name].onload = this._wrapLoadCallback(d.name, this._onAnythingLoad); //Skip blobifying and adding data, it will be added automatically
					this.assets[d.name].src = path.join(config.basePath, d.path);

				} else if (d.options.type == "json") { 
					readFile(path.join(config.basePath, d.path), "utf-8",this._wrapLoadCallback(d.name,this._onJSONLoad))
				}
			} else {
				readFile(path.join(config.basePath, d.path), d.options ? d.options : "", this._wrapLoadCallback(d.name, this._onFileLoad));
			}
		}
	}

	_onFileLoad(name, err, data) {
		if (err) { //Error handling
			console.error(err);
			return
		}

		//Convert nodejs Buffer to standard js ArrayBuffer
		var ab = toArrayBuffer(data);
		//Then convert ArrayBuffer to Blob
		this.assets[name] = new Blob([ab]);
		this._onAnythingLoad(name);
	}

	_onJSONLoad(name, err, data) {
		if (err) {
			console.error(err);
			return
		}

		this.assets[name] = JSON.parse(data);
		console.log(data);
		console.log(this.assets[name])
		this._onAnythingLoad(name);
	}

	_onAnythingLoad(name) {
		console.log(`${name} Loaded!`)
		this.filesLeft--;
		if (this.filesLeft === 0) {
			this.onload();
		}
	}


	_wrapLoadCallback(name, callback) { //Wraps onFileLoad so it knows which file loaded
		return function (err, data) {
			callback.bind(this)(name, err, data);
		}.bind(this);
	}

	/** Loads a ROM image- BROKEN
	 * @param {string} url
	 */
	loadRom(url) {
		loadFile(url, "arraybuffer", (response) => {
			let dataView = new DataView(response);
			let wordCount = dataView.byteLength >> 1;
			//Convert to host endianess
			for (let wordIndex = 0; wordIndex < wordCount; wordIndex++) {

			}

		}, (errorText) => {
			alert(`Failed to load ROM from <code>${url}</code>, recieved status "${errorText}".`)
		})
	}
	/** Wrapped fs.readfile
	 * @param {string|URL} path Filename or File Descriptor
	 * @param {Object|string} options Specifies options for readFile
	 */
	addLoadFile(assetName, path, options) {
		if (options && options.type && options.type == "img") {
			this.assets[assetName] = new Image();
		}
		this.toLoad.push({ name: assetName, path: path, options: options });
	}
}

module.exports = { Loader, toArrayBuffer }