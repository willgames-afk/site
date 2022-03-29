/* Basic Parsing Functions! */

/** Consumes whitespace */
function getToken(input) {
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
	return pLiteral(getToken(input),literal);
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
	var tokenstart = getToken(input);
	var [res, rem, err] = pWhile(tokenstart, regex);
	if (err) {
		return [null, tokenstart, err];
	}
	return [res,rem];
}

var counter = 0;
function ns(reset) {
	console.log(this)
	if (reset) {
		counter = 0;
	}
	return counter++;
	//return new Symbol(...args);
}

const Types = {
	NUM: ns(true),
	INT: ns(),
	STRING: ns(),
	BOOL: ns()
}

const IntrCommands = {
	IFELSE: ns(true),
}

function printEnum(enum) {
	console.log(Obj)
}


console.log(Types.toString())

function pExpr(input, type) {}
function pBlock(input) {};

function pIfElse(input) {
	const [res, rem,  err] = pLiteralToken(input, "if");
	if (err) return [null, rem, err];
	const [res2,rem2,err2] = pLiteralToken(rem, "(");
	if (err2) return [null, rem2, err2];
	const [res3,rem3,err3] = pExpr(rem2, Types.BOOL);
	if (err3) return [null, rem3, err3];
	const [res4,rem4,err4] = pLiteralToken(rem3,")");
	if (err4) return [null, rem4, err4];
	const [res5,rem5,err5] = pBlock(rem4);
	if (err5) return [null, rem5, err5];

	var obj = {type: IntrCommands.IFELSE}

	const [res6,rem6,err6] = pLiteralToken(input, "else");
	if (err6) return 

}