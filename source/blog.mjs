function getPosts() {

	const _dir = fs.readdirSync(blog_dir, { withFileTypes: true });
	var dir = [];
	for (var i = 0; i < _dir.length; i++) {
		if (path.extname(_dir[i].name) == ".md") {
			dir.push({ name: _dir[i].name, });
		}
	}
	return dir;
}

function getCardsBySort(sortType) {

}

function getPostCard(postname, timeZone) {
	var url = path.join(blog_dir, postname);
	var parsed = splitFile(fs.readFileSync(url).toString()); //Get the file
	return postCardTemplate.fill({
		title: parsed.title,
		subtitle: parsed.subtitle,
		date: new Date(parsed.timecode).toLocaleDateString("en-US", { timeZone: timeZone || 'America/Los_Angeles' })
	})

}
function addTimecode(filePath) { //Inserts a timecode into a file
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