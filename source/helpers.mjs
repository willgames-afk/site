export function NLtoBR(string) {
	return string.replace(/(?:\r\n|\r|\n)/g, "<br>")
}

export function red(string) {
	return `\x1b[31m${string}\x1b[0m`
}

export function green(string) {
	return `\x1b[32m${string}\x1b[0m`
}
export function replace(replacestring, index1, index2, string) {
	var part1 = replacestring.substring(0, index1);
	var part2 = replacestring.substring(index2)
	return part1 + string + part2;
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
export function convertLatex(mdstring) {
	var out = mdstring;
	var match;
	while ((match = /```latex\n[^`]+\n```/.exec(out)) !== null) {
		const toConvert = match[0].substring(9, match[0].length - 4)
		const converted = katex.renderToString(toConvert, { displayMode: true });
		out = replace(out, match.index, match.index + match[0].length, '<br>' + converted + '<br>')
	}
	return out;
}