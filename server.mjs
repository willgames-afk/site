//Loading of modules

//Load all my custom modules
import { Template, Snippet } from  "./source/templates.mjs";
import { errorMessages, sendErrorMessage } from "./source/errors.mjs";
import { getUser, addUser } from "./source/users.mjs";
import { red, green} from "./source/helpers.mjs"

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
const bcrypt  = require("bcrypt");          // Password Hashing!



const sessionConfig = {
	name: "session-id",
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 2},
	secret: "changeth1s2be_moresecurel&ter",
	resave: false,
	saveUninitialized: false,
}
const saltRounds = 10;

var paths = {
	basepage: "basepage.tmpl",
	postTemplate: "post.tmpl",
	postCardTemplate: "post-card.tmpl",

	index: "index.page",

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
const res_dir = process.argv[3];
if (!public_dir) {
	console.error("I NEED A PUBLIC DIRECTORY TO SERVE!!!!");
	exit(1);
}
if (!res_dir) {
	console.error("I NEED A RESOURCE DIRECTORY TO FUNCTION!!!!");
	exit(1);
}

const blog_dir = pj(public_dir, "/blog/")

//Fix urls
for (var page in paths) {
	paths[page] = path.resolve(pj(res_dir, paths[page]));
}

//Preload pages
const basepage =         new Template(paths.basepage, true, true); //Page Template
const postTemplate =     new Template(paths.postTemplate, true);
const postCardTemplate = new Template(paths.postCardTemplate, true);
const loginTmpl =        new Template(paths.login, true);
const welcomeTmpl =      new Template(paths.loginWelcome, true);
const createLoginTmpl =  new Template(paths.loginCreate, true);

const index = new Snippet(".page", paths.index, true);

//Convinience functions that depend on the above things in order to run
function generateLoginHtml(req) {
	if (req.session.loggedin) {
		console.log(`Logged in; ${req.session.username}`)
		return welcomeTmpl.fill({username: req.session.username});
	} else {
		console.log(`Not logged in`)
		return loginTmpl.fill();
	}
}
function loadRes(url) {return fs.readFileSync(pj(res_dir, url))}
function loadPub(url) {return fs.readFileSync(pj(public_dir, url))}


//App Init
const app = express();
const converter = new showdown.Converter();

// ---------- App Setup ---------- //

app.use(session(sessionConfig)); //Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
	if (req.method == "GET") {
		console.log(`${green(req.method)}  ${req.path}`)
	} else if (req.method == "POST") {
		console.log(`${red(req.method)} ${req.path}`)
	} else {
		console.log(`${req.method}  ${req.path}`)
	}
	next();
});//Log all server requests (Debug Server only)

app.get('/', (req, res) => {
	//console.log("handled by index handler")
	res.type("html");
	
	res.send(basepage.fill({ content: index, login: generateLoginHtml(req) }));
	
});

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
			res.send(loginTmpl.fill({ usernameErr: usernameErr, passwordErr: passwordErr, username: username }))
		})
	} else {
		res.send(loginTmpl.fill({ usernameErr: usernameErr, passwordErr: passwordErr, username: username }))
	}
})
app.get("/login/login", (req,res) => {
	if (req.session.loggedin) {
		//If already logged in, redirect to welcome page
		res.redirect("/login/welcome")
	} else {
		//Serve login page (With no errors)
		res.send(loginTmpl.fill({})) //Send Blank login page (no errors)
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
	res.send(createLoginTmpl.fill({}));
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
			usernameErr: usernameErr,
			passwordErr: passwordErr,
			confirmPasswordErr: confirmPasswordErr,
			username: username
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

	if (path.dirname(req.path) == "secure/") {
		res.send("Lol, no.");
	}


	res.type(path.extname(req.url)) //Send correct filetype
	res.send(loadRes(req.url));
})

//  blog/
app.get("/blog/", (req, res) => {
	//console.log("handled by blog homepage handler")
	res.send(basepage.fill({ content: "Blog Homepage", login: generateLoginHtml(req)}))
})
// blog/imgs/**
app.use("/blog/imgs", (req, res) => {
	//console.log("handled by blog image handler")
	var file;
	try {
		file = loadPub(pj("blog/imgs", req.path)); //Get the file
	} catch (err) {
		sendErrorMessage(err, res);
		return;
	}
	res.type(path.extname(req.url));
	res.send(file);
})

// blog/** not including /imgs or /
app.use('/blog/', (req, res) => {
	//console.log("Handled by Blog Handler")
	var url = pj(blog_dir, `${req.url}.md`)
	var rawfile
	try {
		rawfile = fs.readFileSync(url); //Get the file
	} catch (err) {
		sendErrorMessage(err, res);
		return;
	}
	const fileObj = splitFile(rawfile.toString());
	if (!fileObj.timecode) {
		//var timecode = addTimecode(url);
		throw "TODO: Add timecode insertion";
	} else {
		//console.log(fileObj.timecode)
		var timecode = fileObj.timecode;
	}

	const latexConverted = convertLatex(fileObj.file)    //Convert latex to html

	const postContent = converter.makeHtml(latexConverted); //convert markdown to html

	const date = new Date(parseInt(timecode, 10)).toDateString(); //Turn post date into human-readable string

	const page = basepage.fill({
		content: postTemplate.fill({                   //Fill template
			content: postContent,
			title: fileObj.title,
			subtitle: fileObj.subtitle,
			postdate: date
		}),
		login: generateLoginHtml(req)
	})

	res.send(page);
})

//Anything in the public folder will be served from the root directory
app.use('/', (req, res) => {
	console.log("Handled by bulk web handler")
	var file;
3
	//Attempt to load file
	var name = path.extname(req.url);
	try {
		if (name === "") { //Automatically serve index.html s
			//console.log(`Directory; Serving local index.html (${pj(public_dir, req.url, "index.html")})`)
			file = fs.readFileSync(pj(public_dir, req.url, "index.html"));
		} else {
			file = fs.readFileSync(pj(public_dir, req.url))
			if (name == ".page") { 
				file = basepage.fill({
					content: new Snippet(".page",pj(public_dir,req.url),true),
					login: generateLoginHtml(req)
				});
			}
		}

		//If error is thrown, send error page
	} catch (err) {
		if (err.code == "ENOENT" && fs.existsSync(paths.pagenotfound)) {
			console.log("404 not found")
			console.log(paths.pagenotfound);
			res.status(404)
			res.send("err: not found");
			return
		}

		sendErrorMessage(err, res);
		return;
	}

	//If no errors have been thrown, send file (with correct filetype)
	if (name === "" || name === ".page") {
		res.type("html")
		res.send(file);
	} else {
		res.type("." + path.extname(req.url)) //Send correct filetype
		res.send(file);
	}
})

app.get("/backend")

//Start the app
app.listen(port, () => {
	console.log(`Markdown Web Server listening at http://localhost:${port} \nWith resources at '${res_dir}' and site at '${public_dir}'`);
})