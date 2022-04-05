/* Basic Parsing Functions! */

/** Consumes whitespace */
function getToToken(input) {
	return input.trimStart();
}

/** Parses a literal string */
function pLiteral(input, literal) {

	if (input.length < literal.length) {
		return [null, input, `Error: Expected ${literal}.`]
		//It can't match if there's not enough input
	}
	if (input.substring(0,literal.length) == literal) {
		return [literal, input.substring(literal.length)]
	}	else {
		return [null, input,`Error: Expected ${literal}.`];
	}
}

/** `pLiteral` but it consumes whitespace first */
function pLiteralToken(input, literal) {
	return pLiteral(getToToken(input),literal);
}

/** Parses characters that match the regex until it finds one that doesn't.*/
function pWhile(input, regex) {
    var out = "", i=0;
    while (regex.test(input[i])) {
        out += input[i];
		i++;
	}
	if (out.length == 0) {
		return [null, input, "Error: Expected character matching regex " + regex];
	}
	return [out, input.substring(i)]
}


/** `pWhile` but it consumes whitespace first */
function pWhileToken(input, regex) {
	var tokenstart = getToToken(input);
	var [res, rem, err] = pWhile(tokenstart, regex);
	if (err) {
		return [null, tokenstart, err];
	}
	return [res,rem];
}

const types = [
	"int"
]

export function pInt(input) {
   
	var [num,rem,err] = pWhileToken(input,/\d/);
	if (err) return [num,rem,"TypeError: Expected Integer"];

	var val = parseInt(num);
    if (isNaN(val)) {
        return [num,rem,"TypeError: Expected Integer"];
    }
	
    return [val, rem]
}


function pType(input) {
	var [res, rem, err] = ["", "", ""]
	for (var i=0;i<types.length;i++) {
		[res, rem, err] = pLiteralToken(input,types[i]);
		if (!err) {
			return [res, rem]
		}
	}
	return [res, rem, "Error: Invalid non-array type"];
}

function pListInclusiveType(input) {
	console.log("Trying to parse '[' " + input)
	var [res0,rem0,err0] = pLiteralToken(input, "[");
	if (err0) {
		console.error("Failed, trying to parse a normal integer "+ rem0)
		var [type, rem, err] = pType(input);
		if (err) return [res,rem, `Error: Invalid Type`];
		console.log("Parsed type, parsing integer")
		var [count, rem2, err2] = pInt(rem);
		if (err2) {
			console.log("No integer, using single element type");
			return [[type, 1],rem];
		}
		console.log("Parsed number")
		return [[type, count],rem2];
	}
	console.log("Parsed, starting loop "+ rem0);
	var types = [];

	while (true) {
		console.log("Makeing recursive subtype parse call "+ rem0)
		var [res, rem, err] = pListInclusiveType(rem0);
		if (err) break;

		console.log("Trying to parse count")
		var [count, rem2, err2] = pInt(rem);
		if (!err2) {
			types.push([res, count]);
		} else {
			types.push([res,1]);
		}
		console.log("Trying to parse comma " + rem2)
		var [comma, rem,err2] = pLiteralToken(rem2, ',');
		if (err2) break;

		rem0 = rem;
	}
	console.log ("Failed out of loop, trying to parse ]"+ rem)
	var [cb, remFinal, errFinal] = pLiteralToken(rem,"]");
	if (errFinal) return [null,remFinal,`Error: Invalid Type. Expected close bracket (']')`]
	console.log("Done!")
	return [types,rem]
}