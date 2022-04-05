// TODO: Bring back <head> collection!

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");

export class TemplateSystem {
	constructor(gs) {
		this.globals = gs || {};
	}

	//Adds a new global
	add(name, val) {
		if (typeof val == "function") {
			this.globals[name] = val;
		} else {
			this.globals[name] = ()=>{return val};
		}
	}

	//Loads a template
	load(template, ...params) {
		if (!template) throw "No Template!";
		return new Template(this, template);
	}

	loadFile(path, ...args) {
		return this.load(fs.readFileSync(path,{encoding: "utf-8"}), ...args)
	}
}

export class Template {
	constructor(parent, text) {
		this.parent = parent;
		this.file = text;
	}
	fill(fparams,paramParams) {
		var out = this.file;

		//console.log("attempting to match with file " + out)

		while (true) {
			const match = out.match(/\$(\?)?(\w+)\$|<\$(\w+)\$>/); //Yay magic!
			//match[0] // Everything
			//match[1] // optional or not
			//match[2] // var name
			//match[3] // global name
			
			if (!match) {
				break;
			}
			if (match[2]) {
				if (!fparams || !fparams[match[2]]) {
					if (match[1]) {
						//All is good, it was optional.
						out = out.replace(match[0],"");
					} else {
						console.error("ERR: Unpassed parameter " + match[2]);
						out = out.replace(match[0],"");
					}
					continue;
				}

				out = out.replace(match[0], fparams[match[2]]);
			} else if (match[3]) {
				out = out.replace(match[0], this.parent.globals[match[3]](paramParams));
			}
		}

		return out;
	}
}