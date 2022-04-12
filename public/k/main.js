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

const RIGHT = Symbol();
const LEFT = Symbol();

var intrinsics = [
	{
		_aso: RIGHT,
		lnot: {name: "!",  sig: [["Bool"],        ["Bool"]]},
		bnot: {name: "~",  sig: [["Num"],         ["Num"]]},
		neg:  {name: "-",  sig: [["Num"],         ["Num"]]},
		inc:  {name: "++", sig: [["Num"],         ["Num"]]},
		dec:  {name: "--", sig: [["Num"],         ["Num"]]},
	},{
		_aso: RIGHT,
		pow:  {name: "**", sig: [["Num", "Num"],  ["Num"]]}
	},{
		_aso:LEFT,
		mul:  {name: "*",  sig: [["Num", "Num"],  ["Num"]]},
		div:  {name: "/",  sig: [["Num", "Num"],  ["Num"]]},
		mod:  {name: "%",  sig: [["Num", "Num"],  ["Num"]]},
	},{
		_aso:LEFT,
		add:  {name: "+",  sig: [["Num", "Num"],  ["Num"]]},
		sub:  {name: "-",  sig: [["Num", "Num"],  ["Num"]]},
	}, {
		_aso:LEFT,
		shl: {name: "<<", sig: [["Num", "Num"],  ["Num"]]},
		shr: {name: ">>", sig: [["Num", "Num"],  ["Num"]]},
	}, {
		_aso:LEFT,
		llt: {name: "<",  sig: [["Num", "Num"],  ["Bool"]]},
		lte: {name: "<=", sig: [["Num", "Num"],  ["Bool"]]},
		lgt: {name: ">",  sig: [["Num", "Num"],  ["Bool"]]},
		lge: {name: ">=", sig: [["Num", "Num"],  ["Bool"]]},
	}, {
		_aso:LEFT,
		equ: {name: "==", sig: [["Any", "Any"],  ["Bool"]]},
		neq: { name: "!=", sig: [["Any", "Any"],  ["Bool"]]},
	}, {
		_aso:LEFT,
		band: {name: "&",  sig: [["Num", "Num"],  ["Num"]]},
	}, {
		_aso:LEFT,
		bxor: {name: "^",  sig: [["Num", "Num"],  ["Num"]]},
	},{
		_aso:LEFT,
		bor: {name: "|",  sig: [["Num", "Num"],  ["Num"]]},
	},{
		_aso:LEFT,
		land: {name: "and",sig: [["Bool","Bool"], ["Bool"]]},
	},{
		_aso:LEFT,
		lor: {name: "or", sig: [["Bool","Bool"], ["Bool"]]},
	}
]


function pFactor(input) {
	try {
		return pWhileToken(input, /[0-9]/)
	} catch (e) {
		return ['',input,"Expected 2"]
	}
}

function pMath(input) {
	return _recursiveParse(input,intrinsics.length-1);
}

function _recursiveParse(input,level) {

	if (input.length == 0) return [0, "", "Error: End of input"];
	if (level <= 0) return pFactor(input);

	
	//Recursively parse a single term
	var [term1,remaining,error] = _recursiveParse(input,level-1);

	//Parse some Op-Term pairs
	var struct = term1;
	while (true) {
		//Try to parse an Op from the current level
		for (var op in intrinsics[level]) {
			if (op == "_aso") continue;

			var [oper, rem2, err] = pLiteralToken(remaining,intrinsics[level][op].name);
			if (typeof err === "undefined") {
				break;
			}
		}
		// If it's not a valid Op, we're done
		if (typeof err !== "undefined") {
			return [struct,remaining]; 
		}
		//Otherwise, parse another term
		var [term2,rem3,err] = _recursiveParse(rem2,level-1);

		//Get set up to parse another Op-Term pair
		struct = [struct, term2,op];
		remaining = rem3;
	}
}

function printAST(ast) {
	return _printAST(ast[0]);
}
function _printAST(ast) {
	if (!Array.isArray(ast)) {
		return ast;
	}
	return `(${_printAST(ast[0])} ${ast[2]} ${_printAST(ast[1])})`
}

var x= "2+2+2+2+2*2/2-2"
console.log(x)
console.log(printAST(pMath(x)))