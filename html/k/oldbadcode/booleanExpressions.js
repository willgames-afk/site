import {parseLiteral, parseLiteralToken, parseWhile, getToToken, parseWhileToken} from "../parsing/potassium.js"
import {pnum,typeError} from "./types.js"

function parseVar(input) {
    var [variable,rem,err] = parseWhileToken(input, /[a-zA-Z0-9_]/);
    if (err) return typeError("variable", rem);
    return [{ type: "var", val: variable },rem];
}

/** Parse a Factor (Number, Subexpression or Variable) */
function parseFactor(input) {
    var [_,rem,err] = parseLiteralToken(input, "(");
	if (!err) {
   		var [expr,rem2,err] = parseMath(rem);
		if (!err) {
			var [_,rem3,err] = parseLiteralToken(rem2, ")");
			if (!err) {
				return [expr, rem3];
			}
		}
	}

	var [res,rem,err] = pnum(getToToken(input));
	if (!err) {
		return [res,rem];
	}

	var [res,rem,err] = parseVar(input)
	if (err) {
		return [false, rem, "Expected Number, Variable or ()."]
	}
	return [res,rem];
}

var math = [
//  {Variables, number literals, and function calls}
	{pow: "**",LEFT:true},
	{mul:"*",div:"/",mod:"%"},
	{add:"+",sub:"-"},
	{shl:"<<",shr:">>"},
	{llt:"<",lte: "<=",lgt:">",lge:">="},
	{equ:"==",neq:"!="},
	{band:"&"},
	{bxor:"^"},
	{bor:"|"},
	{land:"and"},
	{lor:"or"},
	{assign: "=", aAdd: "+=", aSub: "-=", aPow: "**=", aMul: "*=",aDiv: "/=",aMod:"%=",aShl:"<<=",aShr: ">>=",aBand:"&=",aBxor:"^=",aBor:"|=",aLand:"and=",aLor:"or="}
].reverse();

var signatures = { //Type signatures for math ops
	// [[<input-1-type>, <input-2-type>], <output-type>]
	pow: [["num", "num" ],"num" ],
	mul: [["num", "num" ],"num" ],
	div: [["num", "num" ],"num" ],
	mod: [["num", "num" ],"num" ],
	add: [["num", "num" ],"num" ],
	sub: [["num", "num" ],"num" ],
	shl: [["num", "num" ],"num" ],
	shr: [["num", "num" ],"num" ],
	llt: [["num", "num" ],"bool"],
	lte: [["num", "num" ],"bool"],
	lgt: [["num", "num" ],"bool"],
	lge: [["num", "num" ],"bool"],
	equ: [["any", "any" ],"bool"],
	neq: [["any", "any" ],"bool"],
	band:[["num", "num" ],"num" ],
	bor: [["num", "num" ],"num" ],
	land:[["bool","bool"],"bool"],
	lor: [["bool","bool"],"bool"],

	assign: [["var","any"],""] 
}


var out = handleError("1 + 3 + (3 + 5)  * 1 * 3 / 5", parseMath)
if (typeof out !== "string") {
	console.log(`Formatted: ${printNicely(out)}`)
	console.log(`Raw:`,out)
} else {
	console.log(out);
}

function printNicely(ast) {
	if (typeof ast == "string") {
		return ast;
	} else if (ast.val) {
		return ast.val;
	}
	return `[${printNicely(ast[0])} ${printNicely(ast[2])} ${printNicely(ast[1])}]`
}
function handleError(input, parseFunction) {
	var [res,rem, err] = parseFunction(input);
	if (err) {
		var line = 1, col = 1;
		for (var i=0;i<input.length - rem.length;i++) {
			if (input[i] == "\n") {
				line++;
				col = 0;
			}
			col++;
		}
		return `${line}:${col} ${err}`;
	} else {
		return res;
	}
}

function parseMath(input) {
	return _recursiveParse(input,0);
}

function _recursiveParse(input,level) {

	if (input.length == 0) return [0, "", "Error: End of input"];
	if (level >= math.length) return parseFactor(input);

	//Recursively parse a single term
	var [term1,remaining,error] = _recursiveParse(input,level+1);
	if (error) {
		return [null, remaining, error];
	}

	//Parse some Op-Term pairs
	var struct = term1;
	while (true) {
		//Try to parse an Op from the current level
		for (var op in math[level]) {
			var [_, rem2, err] = parseLiteralToken(remaining,math[level][op]);
			if (typeof err === "undefined") {
				break;
			}
		}
		// If it's not a valid Op, we're done
		if (typeof err !== "undefined") {
			return [struct,remaining]; 
		}
		//We have a valid op, but we need now need to make sure that it accepts the term we parsed


		//Otherwise, parse another term
		var [term2,rem3,err] = _recursiveParse(rem2,level+1);
		if (err) {
			return [null, rem3,err];
		}

		//Get set up to parse another Op-Term pair
		struct = [struct, term2,op];
		remaining = rem3;
	}
}

function parseBool(input) {
    try {
        var b = parseLiteral(input, "true");
        return [{ type: "bool", val: true }, b[1]]
    } catch {
        var b = parseLiteral(input, "false");
        return [{ type: "bool", val: false }, b[1]]
    }
}

function parseBoolFactor(input) {
    try {
        console.log("Trying to parse subexpresion")
        var p = parseLiteral(getToken(input), "(")
        var exp = parseBoolExpression(getToken(p[1]));
        var p2 = parseLiteral(getToken(exp[1]), ")");
        return [{ type: "boolExpression", val: exp[0] }, p2[1]]
    } catch {
        console.log("no subexpression, parsing bool literal")
        try {
            return parseBool(input)
        } catch {
            console.log("Couldn't parse bool, trying var");
            return parseVar(input)
        }
    }
}

function parseBoolExpression(input) {
    if (input.length == 0) {
        throw "Expected Boolean Expression";
    }
    try {
        var not = parseLiteral(input, "!");
        var bterm1 = parseBoolFactor(not[1]);
        return [{ type: "boolop", val: ["not", bterm1[0]] }, bterm1[1]]
    } catch {
        var bterm1 = parseBoolFactor(input);
        try {
            return _parseBoolExpression(bterm1);
        } catch (e) {
            if (e == "Expected Number" || e == "Expected Boolean") {
                throw e;
            }
            return bterm1;
        }
    }
}

var compareOps = {
    "==": "eq",
    "!=": "noteq",
    ">": "gt",
    "<": "lt",
    ">=": "gteq",
    "<=": "lteq",
}
function parseCompareOp(input) {
    for (var op in compareOps) {
        try {
            var res = parseLiteral(input, op);
            return [{ type: "compareop", val: compareOps[op] }, res[1]]
        } catch {
            continue;
        }
    }
    throw "Expected Compare Operator";
}
function parseBoolOp(input) {
    try {
        var res = parseLiteral(input, "&&");
        return [{ type: "boolOp", val: "and" }, res[1]];
    } catch {
        try {
            var res = parseLiteral(input, "||");
            return [{ type: "boolOp", val: "or" }, res[1]]
        } catch {
            var res = parseLiteral(input, "^^");
            return [{ type: "boolOp", val: "xor" }, res[1]]
        }
    }
}

function _parseBoolExpression(bterm1) {
    switch (bterm.type) {
        case "int":
        case "float":
        case "expression":
            //Operator must be comparison op
            var op = parseCompareOp(bterm1[1]);
            var bterm2 = parseExpression(op[1]); //Parse a number expression
            return [{ type: "boolExpression", val: [op[0], bterm1[0], bterm2[0]] }, bterm2[1]]


        case "bool":
        case "boolExpression":
            //Operator must be bool op
            var op = parseBoolOp(bterm[1]);
            var bterm2 = parseBoolExpression(op[1]);
            return [{ type: "boolExpression", val: [op[0], bterm1[0], bterm2[0]] }, bterm2[1]]
            break;
    }
}

var types = [
	"int",
	"float",
	"bool"
]
function parseTypeSig(input) {
	console.log("Attempting to parse Type Signature")
	for (var type of types) {
		console.log(type)
        try {
            return parseLiteral(input, type);
        } catch {
            continue;
        }
    }
    throw "Expected Type";
}	

function parseAssignment(input) {
	var resultingInput = input;
	var type = "any";
	try {
		var type = parseTypeSig(input);
		resultingInput = type[1];
		type = type[0]

	} catch (e) {
		console.log(e)
	}
    var target = parseVar(getToken(resultingInput));
    var eq = parseLiteral(getToken(target[1]), "=");
    var value = parseExpression(getToken(eq[1]));
	if (type != "any") {
		if (value[0].type != type) {
			throw `TypeError: Expected ${type}, got ${value[0].type}`
		}
	}
    return [{ type: "assign", val: [target[0], value[0]] }, value[1]]
}

function parseEquation(input) {
    var left = parseExpression(getToken(input));
    var eq = parseLiteral(getToken(left[1]), "=");
    var right = parseExpression(getToken(eq[1]));

    return [{type: "equation",val: [left, right]}, right[1]]
}

export function parse(string) {
    var out = [];
    var currentinput = string;
    try {
        while (true) {
            try {
                var res = parseAssignment(currentinput);
                out.push(res[0]);
            } catch {
                var res = parseEquation(currentinput);
                out.push(res[0]);
            }

            try {
                currentinput = parseLiteral(res[1], "\n")[1];
            } catch {
                break;
            }
        }
    } catch (e) {
        console.error(e);
        return e;
    }
    return out
}