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