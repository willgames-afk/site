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

const matchHeadTags = /<head>([\s\S]*)<\/head>/;
const matchSpecialTags = /\$(\?)?(\w+)\$|<\$(\w+)\$>/; //Yay magic!

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

	addWidgetFile(name, url) {
		this.addWidget(name, fs.readFileSync(url, { encoding: "utf-8" }))
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
	*/
	load(template) {
		if (!template) throw "No Template!";
		return new Template(template);
	}

	/** Loads a template from a file
	 * 
	 * @param {import("fs").PathOrFileDescriptor} path 
	 * @returns {Template}
	 */
	loadFile(path) {
		return this.load(fs.readFileSync(path, { encoding: "utf-8" }))
	}

	buildPage(page, paramparams, params) {
		if (page instanceof Template) {
			if (page.metadata?.template === undefined) {
				console.warn("Missing template option in page metadata, defaulting to `page`");
				if (!page.metadata) {
					page.metadata = {template: "page"};
				} else {
					page.metadata.template = "page";
				}
				//return;
			}
			if (!this.templates[page.metadata.template]) {
				console.error("No template found!!!");
				return;
			}
			return this.templates[page.metadata.template].fill({content: page, ...page.metadata, ...params},paramparams, this)
		}
	}
	urlBuildPage(url, paramparams, params) {
		console.log(`building ${url}`)
		return this.buildPage(this.loadFile(url), paramparams, params);
	}
}

/*Templates are pages with a complete HTML header, but are missing content.
HTML header                       - Y
Widgets  (<$name$>)               - Y
Metadata (<$meta$>...</$meta$>)   - N
Params   ($param$)                - Y
*/
export class Template {

	constructor(text) {
		console.log("Started loading a template")
		//console.log(text)
		this.file = text;
		this.metadata = {};
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
				//console.log(this.file.slice(0,i + 1))
				try {
					this.metadata = JSON.parse(this.file.slice(0,i /*+ 1*/));
				} catch (err) {
					console.error(`JSON error in template metadata!!`, err);
				}
				//console.log('data:', data);
			}
		} 
		this.head = this.file.match(matchHeadTags)
	}
	fill(fparams, paramParams, parent) {
		let out = this.file;
		console.log(this);
		console.log(fparams,paramParams,parent)

		while (true) {

			const match = out.match(matchSpecialTags);
			console.log(match)

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
				if (!fparams?.[match[2]]) { //If we dont have it
					console.error("Unpassed Parameter `" + match[2] + '`')
					fillVal = "";
				}
				fillVal = fparams[match[2]]; //otherwise we've got it
			} else if (match[3]) {
				if (!parent?.widgets?.[match[3]]) {
					console.error("Couldn't find widget!!");
					fillVal = ""
				} else {
					fillVal = parent.widgets[match[3]](paramParams)
				}
			} else {
				console.log("Nothing???")
			}

			if (typeof fillVal !== "string") {
				if (fillVal instanceof Template || fillVal instanceof Widget) {
					//Head tags in Pages or Widgets passed as parameters are added to the header of the parent template
					const phead = fillVal.head;
					let thisHead = out.match(matchHeadTags);
					if (phead) {
						if (!thisHead) { //Puts head at start of doc, before even <html>- fine for middle templates but not good for top level templates!
							console.error("Missing head tag in template!!");
							out = "<head></head>" + out;
							thisHead = out.match(matchHeadTags);
						}
						out = out.replace(matchHeadTags, "<head>"+thisHead[1] + phead[1]+"</head>");
						fillVal = fillVal.replace(matchHeadTags,"")
					}
				} else {
					console.error("Wonky fill value detected!")
					console.log(fillVal)
				}
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