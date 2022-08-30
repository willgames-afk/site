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
	load(template) {
		if (!template) throw "No Template!";
		return new Template(this, template);
	}

	loadFile(path, ...args) {
		return this.load(fs.readFileSync(path, { encoding: "utf-8" }), ...args)
	}

	fullyLoadPage(path, ...args) {
		let page = this.loadFile(path, ...args);
		let mdat = page.file.match(/^{[^}]*}/); //Match starting json (stuff inside {})
		if (!mdat) {
			return page.fill({},{}) // TODO Fill with args passed, use basepage
		}
		//TODO do json stuff to fill stuff, idk

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

			//Find a special tag

			//match[0] // Everything
			//match[1] // optional or not
			//match[2] // var name if var
			//match[3] // global name if global

			if (!match) {
				break;
			}

			//Now we replace the tag with its value- first we make sure it's there
			var fillVal;
			if (match[2]) { // If fparam
				if (!fparams || !fparams[match[2]]) { //If we dont have it
					if (match[1]) { //If it's optional, don't complain if it's not passed- just remove it and carry on
						out = out.replace(match[0], "");
					} else {
						console.error("ERR: Unpassed parameter " + match[2]); //If not optional, complain but remove and carry on anyway
						out = out.replace(match[0], "");
					}
					continue;
				}
				fillVal = fparams[match[2]]; //otherwise we've got it
			} else if (match[3]) {
				fillVal = this.parent.globals[match[3]](paramParams)
			}

			//Head tags in filled values are added to the header of the parent template

			var phead = fillVal.match(/<head>([\s\S]*)<\/head>/);
			var thisHead = out.match(/<head>([\s\S]*)<\/head>/);
			if (phead) {
				if (!thisHead) { //Puts head at start of doc, before even <html>- fine for middle templates but not good for top level templates!
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