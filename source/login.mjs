import { getUser, addUser } from "./users.mjs";
import { Template } from  "./templates.mjs";
import { errorMessages } from "./errors.mjs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const bcrypt   = require("bcrypt");         // Password Hashing!

//Handles login post request from widget
function makeLoginReciever(paths) { 
	return (req, res) => {
		//console.log(req.headers.referer);
		const username = req.body.username;
		const password = req.body.password;
		let usernameErr = "", passwordErr = "";
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
						req.session.partialLoginDetails = undefined;
						console.log("LOGIN SUCCESS!", username)
						
						req.session.save(()=>{
							console.log("Session saved!")
							res.redirect(req.headers.referer);
						})
						return;
					} else {
						passwordErr = errorMessages.incorrectPassword;
					}

				} else {
					usernameErr = errorMessages.noUserFound;
				}
				console.log(`Login Failed, ${passwordErr} ${usernameErr}`)
				if (usernameErr.length > 0) usernameErr += '<br>';
				if (passwordErr.length > 0) passwordErr += '<br>';
				req.session.partialLoginDetails = {username, usernameErr, passwordErr}
				req.session.save(()=>{
					console.log("Session saved!")
					res.redirect(req.headers.referer);
				})
			})
		} else {
			//Record login errors, so when page reloads it can show the user
			if (usernameErr.length > 0) usernameErr += '<br>';
			if (passwordErr.length > 0) passwordErr += '<br>';
			req.session.partialLoginDetails = {username, usernameErr, passwordErr}
			req.session.save(()=>{
				console.log("Session saved!")
				res.redirect(req.headers.referer);
			})
		}
	}
}


//Handles create login post request from create login page
function makeCreateLoginReciever(createLoginTmpl) {
	return (req,res) => {
		const username = req.body.username
		const password = req.body.password
		const confirmPassword = req.body.confirm_password
		let usernameErr = "", passwordErr = "", confirmPasswordErr = "";

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

							res.redirect("/login/welcome/");
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
	}
}

//Handles logout request
function logoutReciever (req,res)  {
	req.session.destroy();             //Get rid of session
	res.redirect(req.headers.referer); //Send you back to page you were on
}

let loginInitialized = false;

export function LoginSystem(templates, paths) {
	if (loginInitialized) {
		console.error("Login System Created Twice!");
		return;
	}
	loginInitialized = true;

	const loginTmpl =         templates.loadFile(paths.login);
	const welcomeTmpl =       templates.loadFile(paths.loginWelcome);
	const createLoginTmpl =   templates.loadFile(paths.loginCreate);


	console.log(createLoginTmpl);

	//Login widget generator
	function generateLoginHtml(paramparams) {
		const req = paramparams.req;

		if (req.session.loggedin) {
			console.log(`Logged in; ${req.session.username}`)
			return new Template(welcomeTmpl.fill({username: req.session.username}));
		} else {
			console.log(`Not logged in`);
			let x = {};

			// If there's a problem with login, it'll be stored in session.partialLoginDetails-
			// This way we can add it to the login widget when the page reloads.
			// The session is deleted after filling since it was only there to hold this data temperarily

			if (req.session.partialLoginDetails) {
				x = JSON.parse(JSON.stringify(req.session.partialLoginDetails));
			}
			paramparams.req.session.destroy(); //If we're not logged in, make sure session is empty

			return new Template(loginTmpl.fill(x || {}));
		}
	}
	return {
		widget: generateLoginHtml,
		loginReciever: makeLoginReciever(paths),
		logoutReciever,
		createLoginReciever: makeCreateLoginReciever(createLoginTmpl),
		createLoginTmpl,
	}
}