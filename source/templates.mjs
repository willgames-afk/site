import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");

/*
property | wdgt| tmpl|
-------------------------
head tags| yes | yes |
metadata | no  | yes |
tmpl add | yes | yes |
wdgt add | no? | no  |
server md| yes | no  |
*/



export class TemplateSystem {
	constructor(widgets, templates) {
		this.widgets = widgets || {};
		this.templates = templates || {};
	}

	//Adds a new global widget
	addWidget(name, val) {
		if (typeof val == "function") {
			this.widgets[name] = val;
		} else {
			this.widgets[name] = () => { return val };
		}
	}

	addTemplateFile(name, url) {
		console.log("Loading Template " + name)
		this.templates[name] = this.loadFile(url);
	}
	addTemplate(name, val) {
		this.templates[name] = this.load(val);
	}

	/** Loads a template
	 * 
	 * @param {string} template - The template data
	 * @param {TMPL_TYPE} type - Type of template- one of Template.PAGE, Template.WIDGET or Template.TEMPLATE
	*/
	load(template, type) {
		if (!template) throw "No Template!";
		return new Template(this, template, type);
	}

	/** Loads a template from a file
	 * 
	 * @param {import("fs").PathOrFileDescriptor} path 
	 * @param  {TMPL_TYPE} type 
	 * @returns {Template}
	 */
	loadFile(path, type) {
		return this.load(fs.readFileSync(path, { encoding: "utf-8" }), type)
	}
}

/*Templates are pages with a complete HTML header, but are missing content.
HTML header                       - Y
Widgets  (<$name$>)               - Y
Metadata (<$meta$>...</$meta$>)   - N
Params   ($param$)                - Y
*/
export class Template {

	constructor(parent, text) {
		console.log("Started loading a template")
		this.parent = parent;
		this.file = text;
		if (this.file[0] == "{") {
			let level = 1;
			let i;
			for (i=1;(i<this.file.length) && level != 0;i++) {
				if (this.file[i] == "{") {
					level++;
				} else if (this.file[i] == "}") {
					level--;
				}
			}
			if (level !== 0) {
				console.error("Unmatched Metadata Bracket!!")
			} else {
				console.log(this.file.slice(0,i + 1))
				let data = JSON.parse(this.file.slice(0,i + 1));
				console.log('data:', data);
			}
		} else {
			console.log(this.file[0]);
			console.log("No JSON found!")
		}
	}
	fill(fparams, paramParams) {
		let input = this.file;
		let out = this.file;
		let unfilledParams = [];

		while (true) {

			const match = input.match(/\$(\?)?(\w+)\$|<\$(\w+)\$>/); //Yay magic!

			//Find a special tag

			//match[0] // Everything
			//match[1] // optional parameter or not
			//match[2] // parameter name if parameter
			//match[3] // global widget name if global widget

			if (!match) {
				break;
			}

			//Now we replace the tag with its value- first we make sure it's there
			var fillVal;
			if (match[2]) { // If fparam
				if (!fparams || !fparams[match[2]]) { //If we dont have it
					unfilledParams.push(match[1]);
					continue;
				}
				fillVal = fparams[match[2]]; //otherwise we've got it
			} else if (match[3]) {
				fillVal = this.parent.globals[match[3]](paramParams)
			}

			if (typeof fillVal !== "string") {
				if (fillVal instanceof Page || fillVal instanceof Widget) {
					//Head tags in Pages or Widgets passed as parameters are added to the header of the parent template
					const phead = fillVal.match(/<head>([\s\S]*)<\/head>/);
					let thisHead = out.match(/<head>([\s\S]*)<\/head>/);
					if (phead) {
						if (!thisHead) { //Puts head at start of doc, before even <html>- fine for middle templates but not good for top level templates!
							console.error("Missing head tag in template!!");
							out = "<head></head>" + out;
							thisHead = out.match(/<head>([\s\S]*)<\/head>/);
						}
						out = out.replace(/<head>[\s\S]*<\/head>/, "<head>"+thisHead[1] + phead[1]+"</head>");
						fillVal = fillVal.replace(/<head>[\s\S]*<\/head>/,"")
					}
					if (fillVal instanceof Page) {

					}
				} else if (fillVal instanceof Template) {
					console.error("Templates should never be filled into other templates!!")
				} else {
					console.error("Wonky fill value detected!!!")
				}
			}

			//Fill values can also include metadata
			if (fillVal[0] == "{") {

			}

			out = out.replace(match[0], fillVal);
		}

		return out;
	}
}


/* Widgets are HTML that also contain
HTML header                       - N
Widgets  (<$name$>)               - Y
Metadata (<$meta$>...</$meta$>)   - N
Params   ($param$)                - Y
*/
export class Widget extends Template {
	constructor(...args) {
		super(...args)
		
	}
}