import { Tilemap } from "./tilemap.js"

export class Assets {
	constructor(assets) {
		if (assets) {
			for (var a of assets) {
				this[a] = assets[a];
			}
		}
		this._unloaded = {};
	}
	add(id, content) {
		console.log(`Added ${id}`)
		this[id] = content;
	};
}

export class Loader {
	constructor(assets, audioContext, onload) {
		this.assets = assets || new Assets();
		this.onload = onload;
		this.audioContext = audioContext || new AudioContext();
		this.data = [];
		this.toLoad = 0;
		this.count = 0;
	}
	load(type, id, file) {
		if (type == "spritesheet") {
			console.log(`Adding spritesheet to load`)
			this.data.push({type:type,id:"_" + this.count++,file:id});
		} else {
			console.log(`Adding ${type} ${id} to load`)
			this.data.push({ type: type, id: id, file: file });
		}
		this.toLoad++;
	}
	loadAll() {
		console.log("Load Started!")
		for (var a of this.data) {
			switch (a.type) {
				case "spritesheet":
					this._loadSS.bind(this)(a.id, a.file);
					break;
				case "tilemap":
					break;
				case "image":
					this._loadImg(a.id, a.file, this._onFileLoad);
					break;
				case "audio":
					this._loadAudio(a.id, a.file, this._onFileLoad);
					break;
				case "JSON":
					this._loadJSON(a.id, a.file, this._onFileLoad);
			}
		}
	}
	_onFileLoad(id, res) {
		if (res) {
			this.assets.add(id, res);
		}

		this.toLoad--;
		if (this.toLoad == 0) {
			this.onload(this.assets);
		}
	}
	_loadTilemap(id, file) {
		this._loadJSON(id, file, (obj) => {
			this.assets._unloaded[id] = obj;

			this._loadImg("", obj.tileset.image, (img) => {
				this.assets.add(id, new Tilemap(img, this.assets._unloaded[id]));
				delete this.assets._unloaded[id];
				this._onFileLoad(id);
			})
		})
	}
	_loadSS(id, file) {
		console.log(this)
		this._loadJSON(id, file, function (obj) {
			this.assets._unloaded[id] = {};
			this.assets._unloaded[id].rawdata = obj;


			this._loadImg("", obj.image, function (img) {
				console.log(`Sprite image loaded`,img)
				this.assets._unloaded[id].img = img;

				for (var sprite in this.assets._unloaded[id].rawdata.sprites) {
					console.log(sprite)
					var newSprite = {
						data: this.assets._unloaded[id].rawdata.sprites[sprite],
						img: img
					};
					this.assets.add(sprite, newSprite);
				}
				delete this.assets._unloaded[id];

				this._onFileLoad(id);
			}.bind(this))
		}.bind(this));
	}
	_loadImg(id, file, cb) {
		var img = new Image();
		img.onload = () => { //Wrapped onFileLoad
			if (cb) {
				cb(img);
			} else {
				this._onFileLoad(id, img);
			}
		}
		img.src = file;
	}
	_loadAudio(id, file, cb) {
		this._requestFile(file, (res) => {
			this.audioContext.decodeAudioData(res, (audio) => {
				if (cb) {
					cb(audio);
				} else {
					this._onFileLoad(id, audio);
				}
			})
		}, () => {
			console.log(`Error loading audio (ID: ${id})`);
		}, "arraybuffer")
	}
	_loadJSON(id, file, cb) {
		this._requestFile(file, (res) => {
			console.log(res)
			if (cb) {
				cb(JSON.parse(res))
			} else {
				this._onFileLoad(id, JSON.parse(res))
			}
		})
	}
	_requestFile(url, callback, error = () => { }, resType) {
		var req = new XMLHttpRequest();
		req.open("GET", url);
		req.responseType = resType;
		req.addEventListener("loadend", () => {
			callback(req.response);
		})
		req.addEventListener("error", error);
		req.send();
	}
}