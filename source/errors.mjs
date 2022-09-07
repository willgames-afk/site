import {NLtoBR} from "./helpers.mjs"
import {Template} from "./templates.mjs"

export const errorMessages = {
	// HTTP/File Error Messages

	EPERM: "Sorry,but you don't have the permissions to do that. \n(EPERM)",
	ENOENT: "Couldn't find this file :( \n(ENOENT)",
	EACCES: "Sorry, but you don't have access to that! \n(EACCES)",
	ECONNREFUSED: "Connection Refused. \n(ECONNREFUSED)",
	ECONNRESET: "Connection reset by peer. :( \n(ECONNRESET)",
	EMFILE: "Too many open files in system. (Probably due to Will writing bad code) \n(EMFILE)",
	ENOTFOUND: "DNS lookup failed. \n(ENOTFOUND)",
	ETIMEDOUT: "Timed Out :( \nMaybe try refresing? \n(ETIMEDOUT)",

	// Login Error Messages
	promptUsername: "Please enter your username.", //Username Messages
	noUserFound: "No account found with that username.",
	usernameTaken: "Sorry, but someone else already got that username :(",
	usernameTooLong: "Username too long- Max Username Length is 40 Characters (really long usernames would just get cut off anyway)",

	promptPassword: "Please enter your password.", //Password Messages
	incorrectPassword: "Invalid Password. Either that, or we messed up big time.",
	passwordTooShort: "Your password has to have more than 12 characters. Otherwise, it's not very secure.",
	passwordTooLong: "Sorry, but we don't support passwords longer than 256 characters. This is to prevent trollers from breaking the login system with insanely long passwords ;)",

	promptConfirmPassword: "Please confirm your password.",
	differentPasswords: "The passwords you entered don't match!",

	serverError: "Sorry, there was some kind of server-side issue. Please contact Will, or try again later."
}


export function buildError(err) {
	console.error("\x1b[31mGENERATED ERROR!\x1b[0m\n", err);
	//res.type("html");
	//res.send("<h1>Error</h1>" + NLtoBR(errorMessages[err.code]));
	return "<h1>Error</h1>" + NLtoBR(errorMessages[err.code])
}