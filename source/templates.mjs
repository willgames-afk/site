import e from "express";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");
const P = require("path")

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

	/** Loads a template (from a string) */
	load(template) {
		if (!template) throw "No Template!";
		return new Template(template);
	}

	/** Loads a template from a file */
	loadFile(path) {
		console.log(`Loading \`${P.basename(path).substring(0, 20)}\``);
		return this.load(fs.readFileSync(path, { encoding: "utf-8" }))
	}

	//Builds a page- You give us a page. If it's got a template option in its metadata, we'll fill it into that template.

	//If the template parameter is boolean true, that means it's a page wic
	buildPage(page, paramParams, params, template) {
		console.log("Building page")
		//console.log(page);
		console.log(template);

		let mdat = page.metadata || {};

		if (mdat.template === undefined) {

			if (template === true) {
				console.warn("Missing template option in page metadata, defaulting to `page`");
				mdat.template = "page";
			} else if (typeof template == "string") {
				mdat.template = template;
			} else {
				mdat.template = "none";
			}
		}

		console.log("Using template " + mdat.template)

		if (mdat.template == "none") {
			if (page instanceof Template) {
				return page.fill(params, paramParams, this);
			} else {
				return page;
			}
		}

		if (!this.templates[mdat.template]) {
			console.error("No template found!!!");
			return;
		}

		const tmpl = this.templates[mdat.template]

		const templateWithContent = tmpl.fill({content: page, ...mdat, ...params}, paramParams, this);
		if (tmpl.metadata.template === "none") {
			
			return templateWithContent;
		}
		const TWCwithHead = new Template(templateWithContent, false, tmpl.head);

		const parentTemplateWithContent = this.buildPage(TWCwithHead, paramParams, {...tmpl.metadata, ...mdat}, tmpl.metadata.template);

		return parentTemplateWithContent
	}

	urlBuildPage(url, paramparams, params) {
		console.log(`building ${url}`)
		const isPage = P.extname(url) == ".page" ? true : false;
		return this.buildPage(this.loadFile(url), paramparams, params, isPage);
	}
}

//Metadata includes <head> tags and header json
//Anything that includes metadata has to be a TBase

//Pages:     metadata and widgets; Extends TBase
//Widgets:  Just templates 
//Templates: metadata, widgets, params, and subtemplates; Extends Page
/*
class TBase { //Base class for things within the template system
	constructor(text, head, metadata) {
		this.text = text;
		this.metadata = {};
		if (metadata !== undefined) {
			this.metadata = metadata;
		} else if (this.text[0] == "{") {
			let level = 1;
			let i;
			for (i=1;(i<this.text.length) && level != 0;i++) {
				if (this.text[i] == "{") {
					level++;
				} else if (this.text[i] == "}") {
					level--;
				}
			}
			if (level !== 0) {
				console.error("Unmatched Metadata Bracket!!")
			} else {
				try {
					this.metadata = JSON.parse(this.text.slice(0,i /*+ 1 * /));
				} catch (err) {
					console.error(`JSON error in template metadata!!`, err);
				}
				this.text = this.text.substring(i);
			}
		} 

		if (head !== undefined) {
			this.head = head;
		} else {
			const match = this.text.match(matchHeadTags)
			if (match) {
				this.head = match[1]
				//this.file = this.file.replace(matchHeadTags,"") 
			} else {
				this.head = "";
			}
		}
	}
}
/*
class Page extends TBase {
	constructor(text, head, metadata) {
		super(text,head,metadata);
	}
	fill(iparams, parent) {
		//Fill but without params
	}
}

class Template extends Page {
	constructor(text,head,metadata) {
		super(text,head,metadata);
	}
	fill(fparams, iparams, parent) {
		//Fill but with params
	}
}
*/
export class Template {

	constructor(text, isPage, headTags) {
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

		this.head = "";

		if (headTags !== undefined) {
			this.head = headTags;
		} else {
			const match = this.file.match(matchHeadTags)
			if (match) {
				this.head = match[1]
				//this.file = this.file.replace(matchHeadTags,"")
			}
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

		
			
			if (fillVal instanceof Template) {
		
				//Head tags in Pages or Widgets passed as parameters are added to the header of the parent template
				const phead = fillVal.head;
				let thisHead = out.match(matchHeadTags);
				if (phead !== undefined) {
					if (!thisHead) { //Puts head at start of doc, before even <html>- fine for middle templates but not good for top level templates!
						console.error("Missing head tag in template!!");
						out = "<head></head>" + out;
						thisHead = out.match(matchHeadTags);
					}
					out = out.replace(matchHeadTags, "<head>"+thisHead[1] + phead + "</head>");
					fillVal = fillVal.file.replace(matchHeadTags,"")
				
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



/*
export class Widget extends Template {
	constructor(...args) {
		super(...args)
	}
}
export class Page extends Template {
	constructor(...args) {
		super(...args)
	}
}*/