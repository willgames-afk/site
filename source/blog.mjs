import {replace} from './helpers.mjs';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");
const path = require("path");

export function getPosts(blogDir) {

	const _dir = fs.readdirSync(blogDir, { withFileTypes: true });
	var dir = [];
	for (var i = 0; i < _dir.length; i++) {
		if (path.extname(_dir[i].name) == ".md") {
			var obj = {name: _dir[i].name.substring(0,_dir[i].name.length-3)};
			var d = splitFile(fs.readFileSync(path.join(blogDir, _dir[i].name),{encoding: "utf-8"}));
			if (!d.timecode) {
				d.timecode = Date.now();
				addTimecode(path.join(blogDir, _dir[i].name),fs)
			}
			obj.timecode = d.timecode;
			dir.push(obj);
		}
	}
	return dir;
}

export function getCards(posts, sortMethod) {
	
}

export function addTimecode(filePath, fs) { //Inserts a timecode into a file
	var code = Date.now();
	var fileData = fs.readFileSync(filePath).toString();
	var insertIndex = fileData.indexOf("\n", fileData.indexOf("\n") + 1) + 1; //Get the position after the second newline (So the 3rd line)

	var fileEnd = fileData.substring(insertIndex);

	var file = fs.openSync(filePath, 'r+');
	var newFileEnd = code + "\n" + fileEnd;
	fs.writeSync(file, newFileEnd, insertIndex); //Replaces the end of the file with the timecode, followed by the rest of the file.
	fs.closeSync(file);
	return code;
}

export function splitFile(poststring) { //Splits a md post into metadata and file
	var index = poststring.indexOf('\n');
	const title = poststring.substring(0, index);
	index++;
	var newIndex = poststring.indexOf('\n', index);
	const subtitle = poststring.substring(index, newIndex);
	newIndex++
	index = poststring.indexOf('\n', newIndex);
	const timecode = poststring.substring(newIndex, index);
	const file = poststring.substring(index);
	return {
		title,
		subtitle,
		timecode,
		file
	}
}

//Takes the latex expressions out and converts them into html
export function convertLatex(mdstring, katex) {
	var out = mdstring;
	var match;
	while ((match = /```latex\n[^`]+\n```/.exec(out)) !== null) {
		const toConvert = match[0].substring(9, match[0].length - 4)
		const converted = katex.renderToString(toConvert, { displayMode: true });
		out = replace(out, match.index, match.index + match[0].length, '<br>' + converted + '<br>')
	}
	return out;
}