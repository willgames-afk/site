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

export function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
	return array;
}