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
			this.globals[name] = () => { return val };
		}
	}

	//Loads a template
	load(template, ...params) {
		if (!template) throw "No Template!";
		return new Template(this, template);
	}

	loadFile(path, ...args) {
		return this.load(fs.readFileSync(path, { encoding: "utf-8" }), ...args)
	}
}

export class Template {
	constructor(parent, text) {
		this.parent = parent;
		this.file = text;
	}
	fill(fparams, paramParams) {
		var out = this.file;



		while (true) {
			const match = out.match(/\$(\?)?(\w+)\$|<\$(\w+)\$>/); //Yay magic!
			//match[0] // Everything
			//match[1] // optional or not
			//match[2] // var name
			//match[3] // global name

			if (!match) {
				break;
			}
			var fillVal;
			if (match[2]) {
				if (!fparams || !fparams[match[2]]) {
					if (match[1]) {
						//All is good, it was optional.
						out = out.replace(match[0], "");
					} else {
						console.error("ERR: Unpassed parameter " + match[2]);
						out = out.replace(match[0], "");
					}
					continue;
				}
				fillVal = fparams[match[2]];
			} else if (match[3]) {
				fillVal = this.parent.globals[match[3]](paramParams)
			}

			//console.log("FV:", fillVal)

			var phead = fillVal.match(/<head>([\s\S]*)<\/head>/);
			var thisHead = out.match(/<head>([\s\S]*)<\/head>/);
			if (phead) {
				if (!thisHead) {
					out = "<head></head>" + out;
					thisHead = out.match(/<head>([\s\S]*)<\/head>/);
				}
				out = out.replace(/<head>[\s\S]*<\/head>/, "<head>"+thisHead[1] + phead[1]+"</head>");
				fillVal = fillVal.replace(/<head>[\s\S]*<\/head>/,"")
			}

			out = out.replace(match[0], fillVal);
		}

		return out;
	}
}