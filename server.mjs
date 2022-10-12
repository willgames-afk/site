// TODO: Import more finished projects from replit.com
// TODO: Finish Login System
// TODO: Implement Comment System

//Load all my custom modules
import { Template, TemplateSystem } from  "./source/templates.mjs";
import { errorMessages } from "./source/errors.mjs";
import { LoginSystem } from "./source/login.mjs";
import { red, green, shuffleArray, NLtoBR} from "./source/helpers.mjs"
import { splitFile, convertLatex, getPosts } from "./source/blog.mjs"

//Get reqire so I can load everything else
import { createRequire } from "module";
import { exit } from "process";
const require = createRequire(import.meta.url);

const fs       = require('fs');             // Files
const express  = require('express');        // Server
const session  = require("express-session") // Session Stuff
const showdown = require("showdown");       // Markdown to HTML
const katex    = require("katex");          // LATeX to HTM
const path     = require("path");           // File Path stuff
const pj       = path.join;                 // Shorten!
const {URL}    = require("url")
//const bcrypt   = require("bcrypt");         // Password Hashing!
const readline = require('readline');
const { stdin} = require('process');


const sessionConfig = {
	name: "session-id",
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 2},
	secret: "changeth1s2be_moresecurel&ter@$^)!^",
	resave: false,
	saveUninitialized: false,
}
const saltRounds = 10;

var paths = {
	basepage: "page.tmpl",
	postTemplate: "post.tmpl",
	postCardTemplate: "post-card.wdgt",

	//index: "index.tmpl",

	login: "login.wdgt",
	loginWelcome: "welcome.wdgt",
	loginCreate: "createLogin.wdgt",

	loading: "loading.wdgt",

	pagenotfound: "404page.page",
	users: "secure/users.txt"
}


// ---------- App Initialization ---------- //

//Get Commandline args
const port = process.env.PORT || 3000;
const public_dir = process.argv[2];
const res_dir = process.argv[3] || pj(public_dir, "/.resources/");
if (!public_dir) {
	console.error("I NEED A PUBLIC DIRECTORY TO SERVE!!!!");
	exit(1);
}
if (!res_dir) {
	console.error("Resource directory not found!")
}
console.log("LOADING")

const blog_dir = pj(public_dir, "/blog/")

//Fix urls
for (var page in paths) {
	paths[page] = path.resolve(pj(res_dir, paths[page]));
}

function loadRes(url) {return fs.readFileSync(pj(res_dir, url), {encoding: "utf-8"})}

//Init templates
const templates = new TemplateSystem();

//Preload pages
const basepage =          templates.addTemplateFile("page", paths.basepage); //Page Template
const postTemplate =      templates.addTemplateFile("blog",paths.postTemplate);
const postCardTemplate =  templates.loadFile(paths.postCardTemplate);

//Init Login System (Internally loads a few templates)
const LS = LoginSystem(templates,paths);


//Widgets
templates.addWidget("login", LS.widget);
templates.addWidgetFile("loading", paths.loading);

const errHTML =           new Template('{"template": "none"}<h1>Error</h1>$message$')

//Error page generator
function generateErrorHTML(err) {
	console.error("\x1b[31mGENERATED ERROR!\x1b[0m\n", err);

	return templates.buildPage(errHTML,{},{message: NLtoBR(errorMessages[err.code])});
}


console.log("ASSETS LOADED")

//Convinience functions that depend on the above things in o

//App Init
const app = express();
const converter = new showdown.Converter();

console.log("Getting posts...")
let blogPosts = getPosts(blog_dir);
console.log(blogPosts);

// ---------- App Setup ---------- //

//Middleware for login form stuff
app.use(session(sessionConfig));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
	if (req.method == "GET") {
		console.log(`${green(req.method)}  ${req.path} (${req.ip})`)
	} else if (req.method == "POST") {
		console.log(`${red(req.method)} ${req.path} (${req.ip})`)
	} else {
		console.log(`${req.method}  ${req.path} (${req.ip})`)
	}
	next();
});//Log all server requests (Debug Server only)

//Login Stuff
app.post("/login/login/",LS.loginReciever);

app.use("/login/logout/",LS.logoutReciever);

app.get( "/login/createLogin", (req,res)=>LS.createLoginTmpl.fill());
app.post("/login/createLogin/",LS.createLoginReciever);

//Resources
app.use('/resources/', (req, res) => {
	//console.log("handled by resources handler")
	console.log(req.url);
	console.log(path.dirname(req.url))
	
	if (path.dirname(req.url) == "/secure") {
		res.type("text/plain");
		res.send("Lol, no.");
		return;
	}

	try {
		const lr = loadRes(req.url) 
		res.type(path.extname(req.url)) //Send correct filetype
		res.send(lr);
	} catch (e) {
		res.type("html");
		res.send(generateErrorHTML(e));
	}
})


app.get("/blog/cards/", (req,res)=>{
	var count = parseInt(req.query.n);
	var sort = req.query.sort;

	console.log("Count and sort:")
	console.log(count, sort)
	
	res.type(".json");
	res.send(getCardsBySort(sort,count));
});

// Deal with md files in blog directory
app.use('/blog/', (req, res, next) => {
	//console.log("Handled by Blog Handler")
	var url = pj(blog_dir, `${req.url}.md`)
	var rawfile
	try {
		rawfile = fs.readFileSync(url, {encoding: "utf-8"}); //Get the file
	} catch (err) {
		next();
		return;
	}
	const fileObj = splitFile(rawfile.toString());
	if (!fileObj.timecode) {
		var timecode = addTimecode(url, fs);
		//throw "TODO: Add timecode insertion";
	} else {
		//console.log(fileObj.timecode)
		var timecode = fileObj.timecode;
	}

	const latexConverted = convertLatex(fileObj.file, katex)    //Convert latex to html
	const postContent = converter.makeHtml(latexConverted); //convert markdown to html
	const date = new Date(parseInt(timecode, 10)).toDateString(); //Turn post date into human-readable string

	const page = templates.buildPage(postContent,{req},{
		title: fileObj.title,
		subtitle: fileObj.subtitle,
		postdate: date
	},"blog")

	res.type("html");
	res.send(page);
})

function getCardsBySort(sortType, max,timezone) {
	var posts = [];
	switch (sortType) {
		case "random":
			posts = shuffleArray(blogPosts).slice(0,max);
			break;
		case "old-new":
			posts= blogPosts.sort((a,b)=>{
				return a.timecode-b.timecode;
			}).slice(0,max);
			break;
		case "new-old":
			posts=  blogPosts.sort((a,b)=>{
				return b.timecode-a.timecode	
			}).slice(0,max);
			break;
	}
	var output = "["
	for (var i=0;i<posts.length;i++) {
		output += '"'+getPostCard(posts[i].name,timezone).replace(/\n/g,"\\n").replace(/"/g,`\\"`).replace(/\t/g,"\\t") + '"';
		if (i<posts.length-1) {
			output += ",\n"
		}
	}
	output += "]";
	console.log(output)
	return output;
}

function getPostCard( postname, timeZone) {
	var url = pj(blog_dir, postname + ".md");
	var parsed = splitFile(fs.readFileSync(url, {encoding: "utf-8"})); //Get the file
	return postCardTemplate.fill({
		name: postname,
		title: parsed.title,
		subtitle: parsed.subtitle,
		date: new Date(parseInt(parsed.timecode)).toDateString()
	})

}

//Anything in the public folder will be served from the root directory
app.use('/', (req, res) => {
	console.log("Hit web handler")
    console.log(req.body);
	let maybeFile = ""
	try {
		maybeFile = renderFindPage(req,res);
	} catch (err) {
		maybeFile = generateErrorHTML(err);
	}
	if (maybeFile) {
		res.type("html");
		res.send(maybeFile);
	}
})

function renderFindPage(req,res) {
	let file;
	switch (path.extname(req.url)) {
		case "":
			try { //Try to find an index.html
				file = fs.readFileSync(pj(public_dir, req.url, "index.html"),{encoding: "utf-8"});
			} catch (e) {
				if (e.code == "ENOENT") {
					try { //Try to find an index.page
						file = templates.urlBuildPage(pj(public_dir, req.url, "index.page"), {req}, {});
					} catch (err) {
						if (err.code == "ENOENT") {
							file = templates.urlBuildPage(paths.pagenotfound,{req},{});
						} else {
							throw err;
						}
					}
				} else {
					throw e;
				}
			}
			break;
		case ".page":
			file = templates.urlBuildPage(pj(public_dir, req.url),{req},{});
			break;
		default:
			//file = fs.readFileSync(pj(public_dir, req.url))
			res.sendFile(req.url,{root: public_dir});
			return;
	}
	return file;
}


//Start the app
app.listen(port, () => {
	console.log(`Willgames Web Server listening on http://localhost:${port} \n at ${path.resolve(public_dir)}`);
})

const rl = readline.createInterface({ input: stdin });
rl.on("line",(l)=>{
	switch (l.toLowerCase()) {
		case "reload":
			//TODO: Allow hot reloading of templates without requiring server restart
			console.error("That's broken right now")
			break;
		default:
			console.log("? => " + l + "\n(That's not a command I recognise)")
			break;
	}
})