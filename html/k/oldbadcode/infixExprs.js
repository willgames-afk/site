import {parseLiteral, parseLiteralToken, parseWhile, parseWhileToken, tryparse} from "./basic.js"
import {pnum,typeError} from "./types.js"

function parseVar(input) {
    var [variable,rem,err] = parseWhileToken(input, /[a-zA-Z0-9_]/);
    if (err) return typeError("variable", rem);
    return [{ type: "var", val: variable },rem];
}

/** Parse a Factor (Number, Subexpression or Variable) */
function parseFactor(input) {
    //It might be negative- try that first

    var [_,rem,err] = parseLiteralToken(input, "(");
    var [expr,rem2,err] = parseMath(rem);
	var [_,rem3,err] = parseLiteralToken(rem2, ")");
        
	return [{ type: "expression", val: exp[0] }, p2[1]]
	
    } catch {
        console.log("no subexpression, parsing num")
        try {
            return parseNum(input);
        } catch {
            console.log("Couldn't parse number, trying var");
            return parseVar(input)
        }
    }
}

const RIGHT = new Symbol();
const LEFT = new Symbol();

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
		{internalName: "llt", name: "<",  sig: [["Num", "Num"],  ["Bool"]]},
		{internalName: "lte", name: "<=", sig: [["Num", "Num"],  ["Bool"]]},
		{internalName: "lgt", name: ">",  sig: [["Num", "Num"],  ["Bool"]]},
		{internalName: "lge", name: ">=", sig: [["Num", "Num"],  ["Bool"]]},
	}, {
		_aso:LEFT,
		{internalName: "equ", name: "==", sig: [["Any", "Any"],  ["Bool"]]},
		{internalName: "neq", name: "!=", sig: [["Any", "Any"],  ["Bool"]]},
	}, {
		_aso:LEFT,
		{internalName: "band",name: "&",  sig: [["Num", "Num"],  ["Num"]]},
	}, {
		_aso:LEFT,
		{internalName: "bxor",name: "^",  sig: [["Num", "Num"],  ["Num"]]},
	},{
		_aso:LEFT,
		{internalName: "bor", name: "|",  sig: [["Num", "Num"],  ["Num"]]},
	},{
		_aso:LEFT,
		{internalName: "land",name: "and",sig: [["Bool","Bool"], ["Bool"]]},
	},{
		_aso:LEFT,
		{internalName: "lor", name: "or", sig: [["Bool","Bool"], ["Bool"]]},
	}
]


var math = [ //Builtin Infix Functions
//  {Variables, number literals, and function calls}
	{pow: "**"},
	{mul:"*",div:"/",mod:"%"},
	{add:"+",sub:"-"},
	{shl:"<<",shr:">>"},
	{llt:"<",lte: "<=",lgt:">",lge:">="},
	{equ:"==",neq:"!="},
	{band:"&"},
	{bxor:"^"},
	{bor:"|"},
	{land:"and"},
	{lor:"or"}
].reverse();


function parseMath(input) {
	return _recursiveParse(input,0);
}

function _recursiveParse(input,level) {

	if (input.length == 0) return [0, "", "Error: End of input"];
	if (level >= math.length) return parseFactor(input);

	//Recursively parse a single term
	var [term1,remaining,error] = _recursiveParse(input,level+1);

	//Parse some Op-Term pairs
	var struct = term1;
	while (true) {
		//Try to parse an Op from the current level
		for (var op in math[level]) {
			var [oper, rem2, err] = parseLiteralToken(remaining,math[level][op]);
			if (typeof err === "undefined") {
				break;
			}
		}
		// If it's not a valid Op, we're done
		if (typeof err !== "undefined") {
			return [struct,remaining]; 
		}
		//Otherwise, parse another term
		var [term2,rem3,err] = _recursiveParse(rem2,level+1);

		//Get set up to parse another Op-Term pair
		struct = [struct, term2,op];
		remaining = rem3;
	}
}

/** Parse a multiplication-level operator (* or /) */
function parseMulOp(input) {
    try {
        var res = parseLiteral(getToken(input), "*");
        return [{ type: "op", val: "Mul" }, res[1]];
    } catch {
        try {
            var res = parseLiteral(getToken(input), "/")
            return [{ type: "op", val: "Div" }, res[1]]
        } catch {
            var res = parseLiteral(getToken(input), "%")
            return [{ type: "op", val: "Mod" }, res[1]]
        }
    }
}

/** Parse a term (Factor, possibly followed by some number of mulOp-factor pairs) */
function parseTerm(input) {
    var factor1 = parseFactor(input);
    console.log("Parsed Factor, trying to parse mulOp")
    try {
        return _parseTerm(factor1)
    } catch (e) {
        if (e == "Expected Number") {
            throw e;
        }
        console.log("mulOp failed, returning factor")
        return factor1
    }
}

/** Parses some number of factor-MulOp pairs, see parseTerm */
function _parseTerm(factor1) {
    var mulOp = parseMulOp(factor1[1])
    var factor2 = parseFactor(mulOp[1])

    try {
        return _parseTerm([[mulOp[0], factor1[0], factor2[0]], factor2[1]])
    } catch (e) {
        if (e == "Expected Number") {
            throw e;
        }
        return [{ type: "expression", val: [mulOp[0], factor1[0], factor2[0]] }, factor2[1]]
    }
}

/** Parses an addition-level operator (+ or -) */
function parseAddOp(input) {
    console.log("Trying to parse '+'")
    try {

        var res = parseLiteral(getToken(input), "+");
        return [{ type: "op", val: "Add" }, res[1]];
    } catch {
        console.log("'+' failed, parsing '-'")
        var res = parseLiteral(getToken(input), "-");
        return [{ type: "op", val: "Sub" }, res[1]];
    }
}
function parseShiftOp(input) {
    try {
        var res = parseLiteral(getToken(input), ">>");
        return [{ type: "op", val: "ShiftR" }, res[1]];
    } catch {
        try {
            var res = parseLiteral(getToken(input), "<<");
            return [{ type: "op", val: 'ShiftL' }, res[1]];
        } catch {
            var res = parseLiteral(getToken(input), ">>>");
            return [{ type: "op", val: "UShiftR" }, res[1]]
        }
    }
}
const bitwiseOps = {
    "&": "bitand",
    "|": "bitor",
    "~": "bitnot",
    "^": "bitxor"
}
function parseBitwiseOp(input) {
    try {
        var res = parseLiteral(getToken(input), "&");
        return [{ type: "op", val: "bitand" }]
    } catch {
        try {
            var res = parseLiteral(getToken(input), "|");
            return [{ type: "op", val: "bitor" }]
        } catch {
            var res = parseLiteral(getToken(input), "^");
            return [{ type: "op", val: "bitxor" }]
        }
    }
}


/** Parses a mathematical expression (A Term, possibly followed by some number of addOp-term pairs) */
function parseExpression(input) {
    if (input.length == 0) {
        throw "Expected Expression"
    }
    var term1 = parseTerm(input);
    console.log("Parsed Term, trying to parse AddOp")
    try {
        return _parseExpression(term1)
    } catch (e) {
        if (e == "Expected Number") {
            throw e;
        }
        return term1
    }
}

/** Parses some number of addOp-Term pairs, see parseExpression */
function _parseExpression(term1) {
    var addOp = parseAddOp(term1[1]);
    var term2 = parseTerm(addOp[1]);

    try {
        return _parseExpression([{ type: "expression", val: [addOp[0], term1[0]]}, term2[0]], term2[1]);
    } catch (e) {
        if (e == "Expected Number") {
            throw e;
        }
        return [{ type: "expression", val: [addOp[0], term1[0], term2[0]] }, term2[1]]
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