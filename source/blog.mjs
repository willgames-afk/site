import {replace} from './helpers.mjs';

export function getPosts() {

	const _dir = fs.readdirSync(blog_dir, { withFileTypes: true });
	var dir = [];
	for (var i = 0; i < _dir.length; i++) {
		if (path.extname(_dir[i].name) == ".md") {
			dir.push({ name: _dir[i].name });
		}
	}
	return dir;
}

export function getCardsBySort(sortType) {

}

export function getPostCard(postname, timeZone) {
	var url = path.join(blog_dir, postname);
	var parsed = splitFile(fs.readFileSync(url).toString()); //Get the file
	return postCardTemplate.fill({
		title: parsed.title,
		subtitle: parsed.subtitle,
		date: new Date(parsed.timecode).toLocaleDateString("en-US", { timeZone: timeZone || 'America/Los_Angeles' })
	})

}
export function addTimecode(filePath, fs) { //Inserts a timecode into a file
	var code = Date.now();
	var fileData = fs.readFileSync(filePath).toString();
	var insertIndex = fileData.indexOf("\n", fileData.indexOf("\n") + 1) + 1; //Get the position after the second newline (So the 3rd line)

	var fileEnd = fileData.substring(insertIndex);

	var file = fs.openSync(filePath, 'r+');
	var newFileEnd = code + "\n" + fileEnd;
	fs.writeSync(file, newFileEnd, insertIndex); //Replaces the end of the file with the timecode, followed by the rest of the file.
	fs.close(file);
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
		title: title,
		subtitle: subtitle,
		timecode: timecode,
		file: file
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