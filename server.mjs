// TODO: Blog Cards
// TODO: Import more finished projects from replit.com
// TODO: Finish Login System
// TODO: Implement Comment System

//Load all my custom modules
import { TemplateSystem } from  "./source/templates.mjs";
import { errorMessages, sendError } from "./source/errors.mjs";
import { getUser, addUser } from "./source/users.mjs";
import { red, green} from "./source/helpers.mjs"
import { splitFile, convertLatex } from "./source/blog.mjs"

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
const bcrypt   = require("bcrypt");         // Password Hashing!



const sessionConfig = {
	name: "session-id",
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 2},
	secret: "changeth1s2be_moresecurel&ter@$^)!^",
	resave: false,
	saveUninitialized: false,
}
const saltRounds = 10;

var paths = {
	basepage: "basepage.tmpl",
	postTemplate: "post.tmpl",
	postCardTemplate: "post-card.tmpl",

	index: "index.tmpl",

	login: "login.tmpl",
	loginWelcome: "welcome.tmpl",
	loginCreate: "createLogin.tmpl",

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

const blog_dir = pj(public_dir, "/blog/")

//Fix urls
for (var page in paths) {
	paths[page] = path.resolve(pj(res_dir, paths[page]));
}

//Init templates
const templates = new TemplateSystem();

//Preload pages
const basepage =          templates.loadFile(paths.basepage); //Page Template
const postTemplate =      templates.loadFile(paths.postTemplate);
const postCardTemplate =  templates.loadFile(paths.postCardTemplate);
const loginTmpl =         templates.loadFile(paths.login);
const welcomeTmpl =       templates.loadFile(paths.loginWelcome);
const createLoginTmpl =   templates.loadFile(paths.loginCreate);

//Add thingamabobs
function generateLoginHtml(obj) {
	const req = obj.req;
	if (req.session.loggedin) {
		console.log(`Logged in; ${req.session.username}`)
		return welcomeTmpl.fill({username: req.session.username});
	} else {
		console.log(`Not logged in`)
		return loginTmpl.fill();
	}
}
templates.add("login", generateLoginHtml);
const loadingWidget =  loadRes("loading.tmpl");
templates.add("loading", ()=>{
	return loadingWidget
})

console.log("Basepage:");
console.log(basepage)

//Convinience functions that depend on the above things in o
function loadRes(url) {return fs.readFileSync(pj(res_dir, url), {encoding: "utf-8"})}


//App Init
const app = express();
const converter = new showdown.Converter();

// ---------- App Setup ---------- //

app.use(session(sessionConfig)); //Middleware
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


app.post("/login/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	var usernameErr = "", passwordErr = "";
	if (!username) usernameErr = errorMessages.promptUsername;
	if (!password) passwordErr = errorMessages.promptPassword;

	if (username && password) {
		getUser(username, paths.users,(user) => {
			if (user) {
				if (bcrypt.compareSync(password, user.hash)) {
					/*console.log(req.session.loggedin);
					console.log(req.session.username)*/
					req.session.loggedin = true;
					req.session.username = username;


					console.log("LOGIN SUCCESS!")
					res.redirect("/login/welcome");
					return;
				} else {
					passwordErr = errorMessages.incorrectPassword;
				}

			} else {
				usernameErr = errorMessages.noUserFound;
			}
			console.log(`Login Failed, ${passwordErr} ${usernameErr}`)
			res.send(loginTmpl.fill({ usernameErr,passwordErr, username }))
		})
	} else {
		res.send(loginTmpl.fill({ usernameErr, passwordErr, username }))
	}
})
app.get("/login/login", (req,res) => {
	if (req.session.loggedin) {
		//If already logged in, redirect to welcome page
		res.redirect("/login/welcome")
	} else {
		//Serve login page (With no errors)
		res.send(loginTmpl.fill()) //Send Blank login page (no errors)
	}
})
app.get("/login/welcome", (req,res) => {
	if (req.session.loggedin) {
		res.send(welcomeTmpl.fill({ username: req.session.username }));
	} else {
		res.redirect("/login/login");
	}
})
app.get("/login/createLogin", (req,res) => {
	res.send(createLoginTmpl.fill());
})

app.post("/login/createLogin", (req,res) => {
	const username = req.body.username
	const password = req.body.password
	const confirmPassword = req.body.confirm_password
	var usernameErr = "", passwordErr = "", confirmPasswordErr = "";

	if (!username) {
		usernameErr = errorMessages.promptUsername;
	} else if (username.length > 40) {
		usernameErr = errorMessages.usernameTooLong;
	}

	if (!password) {
		passwordErr = errorMessages.promptPassword;
	} else if (password.length < 12) {
		passwordErr = errorMessages.passwordTooShort;
	} else if (password.length > 256) {
		passwordErr = errorMessages.passwordTooLong;
	}

	if (!confirmPassword) {
		confirmPasswordErr = errorMessages.promptConfirmPassword;
	} else if (password !== confirmPassword) {
		confirmPasswordErr = errorMessages.differentPasswords;
	}

	if (usernameErr.length == 0 && passwordErr.length == 0 && confirmPasswordErr.length == 0) {
		//No errors so far, keep going.
		getUser(username, paths.users, (user) => {
			if (user) {
				usernameErr = errorMessages.usernameTaken;
			} else {
				//At this point, everything is valid
				addUser(username, paths.users, bcrypt.hashSync(password, saltRounds), err => {
					if (err) {
						console.error(err);
						res.send(createLoginTmpl.fill({
							usernameErr: "",
							passwordErr: "",
							confirmPasswordErr: errorMessages.serverError,
							username: username
						}))
					} else {
						req.session.loggedin = true;
						req.session.username = username;

						res.redirect("/login/welcome");
					}
				});
			}
		})
	} else {
		res.send(createLoginTmpl.fill({
			usernameErr,
			passwordErr,
			confirmPasswordErr,
			username
		}))
	}
})

app.use("/login/logout", (req,res) => {
	req.session.destroy();
	res.redirect("/login/login");
});

//Resources
app.use('/resources/', (req, res) => {
	//console.log("handled by resources handler")
	
	if (path.dirname(req.url) == "/secure") {
		res.type("text/plain");
		res.send("Lol, no.");
	}

	res.type(path.extname(req.url)) //Send correct filetype
	res.send(loadRes(req.url));
})


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

	const page = basepage.fill({
		content: postTemplate.fill({                   //Fill template
			content: postContent,
			title: fileObj.title,
			subtitle: fileObj.subtitle,
			postdate: date
		})
	},{req})

	res.type("html");
	res.send(page);
})

//Anything in the public folder will be served from the root directory
app.use('/', (req, res) => {
	var file;

	var ext = path.extname(req.url);
	try {
		switch (ext) {
			case "":
				try {
					file = fs.readFileSync(pj(public_dir, req.url, "index.html"),{encoding: "utf-8"});
				} catch (e) {
					if (e.code == "ENOENT") {
						file = basepage.fill({
							content: templates.loadFile(pj(public_dir, req.url, "index.page")).fill({},{req})
						}, {req});
					} else {
						throw e;
					}
				}
				break;
			case ".page":
				file = basepage.fill({
					content: templates.loadFile(pj(public_dir, req.url, "index.page")).fill({},{req})
				});
				break;
			case ".tmpl":
				file = templates.loadFile(pj(public_dir, req.url)).fill({},{req});
				break;
			default:
				res.sendFile(req.url,{root: public_dir});
				return;
		}
	} catch (err) {
		sendError(err, res)
		console.log(red("Error") + ": ", err)
		return;
	}
	res.type("html");
	res.send(file);
})

//Start the app
app.listen(port, () => {
	console.log(`Willgames Web Server listening on http://localhost:${port} \n at ${path.resolve(public_dir)}`);
})