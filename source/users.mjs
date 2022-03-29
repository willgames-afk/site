import { createRequire } from "module";
const require = createRequire(import.meta.url);

const rl = require("readline");
const fs = require("fs");
const path = require("path")


//Performant user lookup
export function getUser(name, usersfile, onResult) {
	const reader = new rl.createInterface({
		input: fs.createReadStream(usersfile),
		crlfDelay: Infinity
	})
	var wasSuccessful = false;
	reader.on("line", line => {
		const obj = JSON.parse(line);
		if (obj.un == name) {
			onResult(obj);
			wasSuccessful = true;
			reader.close();
		}
	})
	reader.on("close", function () {
		if (wasSuccessful != true) {
			onResult(false);
		}
	})
}

export function addUser(name, usersfile,hash, onresult) {
	fs.appendFile(usersfile, `{"un":"${name}","hash":"${hash}"}\n`, onresult);
}