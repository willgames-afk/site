import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");
const p = require("path")

// HTMLFile is just a standard old HTML file.
export class HTMLFile {
	constructor (path, onload=false) {
		this.onload = onload;
		if (typeof this.onload == "boolean" && this.onload) {
			//If onload == true, it means load sync
			this.file = fs.readFileSync(path, { encoding: "utf8" });
			//this._onInternalLoad();
		} else {
			fs.readFile(path, { encoding: "utf8" }, function (err, data)  {
				if (err) {
					console.error(err);
				} else {
					this.file = data;
					this._onInternalLoad();
				}
			}.bind(this))
		}
	}
	_onInternalLoad() {
		if (typeof this.onload == "function") {
			this.onload();
		}
	}
}

// A snippet has some HTML in it, but it might not a complete HTML Document.
// If if has a special head tag, the data in that tag will be expanded into 
// any templates it fills.
export class Snippet extends HTMLFile{
	constructor(type=".page", path, onload = false, keephead= false) {
		//console.log(`Keephead: ${keephead}`)
		var ext = p.extname(path)
		if (ext.length == 0) {
			path = p.join(p.dirname(path), p.basename(path) + type);
		} else if (ext != type) {
			console.warn(`Expected Extension ${type}, got ${ext} instead. Still loading it tho!`)
		}
		//console.log(`loading ${path}`)

		super(path, onload);
		this.keephead = keephead;
		this._onInternalLoad();
	}
	_onInternalLoad() {
		this._getHead();
		if (typeof this.onload == "function") {
			this.onload();
		}
	}
	_getHead() {
		//console.log("attempting to get head")
		//console.log(`Keephead: ${this.keephead}`)
		var res = this.file.match(/<head>([\s\S]*)<\/head>/m);
		//console.log(res)
		if (res[1]) {
			//console.log("head: ", res[1])
			this.head = res[1];
			if (!this.keephead) {
				//console.log("removed head!")
				this.file = this.file.replace(/<head>[\s\S]*<\/head>/m,"");
			}
		} /*else {
			console.log("no head.")
		}*/
	}
}

// A template is like a snippet, but it may include special parameters that look like this:
// $paramname$
// You can then fill those parameters using the fill method.
// You can specify an optional param by including a ? after the first $-
// $?optionalparamname$
// Params that are not optional have to be filled or it will throw an error.

export class Template extends Snippet {
	constructor(path, onload = false, keephead = false) {
		super(".tmpl", path, onload, keephead);
	}
	_onInternalLoad() {
		this._getHead();
		this._getParams();
		if (typeof this.onload == "function") {
			this.onload();
		}
	}
	_getParams() {
		this.optParams = [];
		while (true) {
			const match = this.file.match(/\$\?(\w+)\$/);
			if (match == null) break;
			this.file = this.file.replace(match[0], "");
			const name = match[1]
			const index = match.index;
			
			const alreadyExists = this.optParams.findIndex(val =>{
				return val[0] == name;
			})
			if (alreadyExists > -1) {
				this.optParams[alreadyExists][1].push(index);
			} else {
				this.optParams.push([name, [index]]);
			}
		}
		this.params = [];

		while (true) {
			const match = this.file.match(/\$(\w+)\$/);
			if (match == null) break;
			this.file = this.file.replace(match[0], "");
			const name = match[1]
			const index = match.index;
			
			const alreadyExists = this.params.findIndex(val =>{
				return val[0] == name;
			})
			if (alreadyExists > -1) {
				this.params[alreadyExists][1].push(index);
			} else {
				this.params.push([name, [index]]);
			}
		}

		console.log(`[${this.params}], [${this.optParams}]`)
	}
	fill(fparams) {
		var out = this.file;
		var head = this.head;
		var shift = 0;
		for (const param of this.params) {
			if (fparams[param[0]] instanceof Snippet || fparams[param[0]] instanceof Template) {
				//console.log("It's a snippet or a template- Is there a head?");
			//	console.log(fparams[param[0]])
				if (fparams[param[0]].head) {
					//console.log("found head!")
					head = head + fparams[param[0]].head;
				}
				for (const location of param[1]) {
					out = out.substring(0,location + shift) + fparams[param[0]].file + out.substr(location + shift);
					shift += fparams[param[0]].file.length;
				}
				continue;
			}
			if (typeof fparams[param[0]] !== "string") {
				throw new Error(`FillTemplate Error: Missing or invalid required fill parameter '${param[0]}'`);
			}

			for (const location of param[1]) {
				out = out.substring(0,location + shift) + fparams[param[0]] + out.substr(location + shift);
				shift += fparams[param[0]].length;
			}
		}
		for (const param of this.optParams) {
			if (fparams?.[param[0]]) {
				if (fparams[param[0]] instanceof Snippet || fparams[param[0]] instanceof Template) {
					if (fparams[param[0]].head) {
						//console.log("found head!")
						head = head + fparams[param[0]].head;
					}
					for (const location of param[1]) {
						out = out.substring(0,location + shift) + fparams[param[0]].file + out.substr(location + shift);
						shift += fparams[param[0]].file.length;
					}
					continue;
				}
				if (typeof fparams[param[0]] !== "string") {
					throw new Error(`FillTemplate Error: Invalid fill parameter '${param[0]}'`);
				}
				for (const location of param[1]) {
					out = out.substring(0,location + shift) + fparams[param[0]] + out.substr(location + shift);
					shift += fparams[param[0]].length;
				}
			}
		}

		out = out.replace(/<head>[\s\S]*<\/head>/m, "<head>" + head + "</head>")


		return out;
	}
}