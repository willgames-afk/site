import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");
const P = require("path")

/*
property | wdgt| tmpl| page
---------------------------
head tags| yes | yes | yes
metadata | no  | yes | yes
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
		//console.log("Loading Template " + name)
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
		console.log(`Loading \`${P.basename(path).substring(0, 20)}\``);
		return this.load(fs.readFileSync(path, { encoding: "utf-8" }))
	}

	buildPage(page, paramParams, params, isPage = false) {
		console.log("Building page")
		
		if (page.metadata === undefined || page.metadata.template === undefined) {
			if (isPage) {
				console.warn("Missing template option in page metadata, defaulting to `page`");
				if (!page.metadata) {
					page.metadata = {template: "page"};
				} else {
					page.metadata.template = "page";
				}
			} else {
				page.metadata.template = "none";
			}
			//return;
		}
		if (page.metadata.template == "none") {
			return page.fill(params, paramParams, this);
		}
		if (!this.templates[page.metadata.template]) {
			console.error("No template found!!!");
			return;
		}
		return this.templates[page.metadata.template].fill({content: page, ...page.metadata, ...params},paramParams, this)
		
	}
	urlBuildPage(url, paramparams, params) {
		console.log(`building ${url}`)
		const isPage = P.extname(url) == ".page" ? true : false;
		return this.buildPage(this.loadFile(url), paramparams, params, isPage);
	}
}

/*Templates are pages with a complete HTML header, but are missing content.
HTML header                       - Y
Widgets  (<$name$>)               - Y
Metadata (<$meta$>...</$meta$>)   - N
Params   ($param$)                - Y
*/

//Pages can contain metadata and widgets but not params
//Templates can contain metadata, widgets and params
//Widgets can also contain metadata, widgets and params

export class Template {

	constructor(text, isPage) {
		/*if (isPage) {
			console.log("Started loading a Page")
		} else {
			console.log("Started loading a Template")
		}*/
		this.isPage = isPage || false;
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
				try {
					this.metadata = JSON.parse(this.file.slice(0,i /*+ 1*/));
				} catch (err) {
					console.error(`JSON error in template metadata!!`, err);
				}
				this.file = this.file.substring(i);
			}
		} 
		const match = this.file.match(matchHeadTags)
        if (match) {
            this.head = match[1]
            //this.file = this.file.replace(matchHeadTags,"")
        }
		console.log("Loaded tmpl/page successfully!\n");
	}
	fill(fparams, paramParams, parent) {
		let out = this.file;
		//console.log(this);
		//console.log(fparams,paramParams,parent)

		while (true) {

			const match = out.match(matchSpecialTags);

			if (match === null) {
				break;
			}

			//Find a special tag

			//match[0] // Everything
			//match[1] // optional parameter or not
			//match[2] // parameter name if parameter
			//match[3] // global widget name if global widget

			const wholeMatch = match[0];
			const isParam    = match[2] ? true : false;
			const isWidget   = match[3] ? true : false;

			//Now we replace the tag with its value- first we make sure it's there
			let fillVal = "";
			if (isParam && !this.isPage) {
				const isOptional = (match[1] ? true : false) && isParam;
				const paramName = match[2]

				if (fparams === undefined || fparams[paramName] === undefined) { //If we dont have it
					if (!isOptional) {
						console.error("Unpassed Parameter `" + paramName + '`')
					}
					//fillVal = "";
				} else {
                    //console.log("Passed parameter `" + paramName +"` value `"+ fparams[paramName] + "`")
                    fillVal = fparams[paramName]; //otherwise we've got it   
                }
			} else if (isWidget) {
				const widgetName = match[3];
				if (parent === undefined || parent.widgets === undefined || parent.widgets[widgetName] === undefined) {
					console.error("Couldn't find widget!!");
					//fillVal = ""
				} else {
					fillVal = parent.widgets[widgetName](paramParams)
				}
			}

			
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
					out = out.replace(matchHeadTags, "<head>"+thisHead[1] + phead + "</head>");
					fillVal = fillVal.file.replace(matchHeadTags,"")
					//console.log("fillVal from object",fillVal)
				}
			} else if (!(typeof fillVal == "string")){
				console.error("Wonky fill value detected!")
				console.log(fillVal)
			}
			

			out = out.replace(wholeMatch, fillVal);
		}
        //console.log(out);

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
export class Page extends Template {
	constructor(...args) {
		super(...args)
	}
}