import {parseWhile, parseWhileToken, parseLiteral, parseLiteralToken, parseone} from "./basic.js"


export function typeError(type,input) {
	return [null, input, "TypeError: Expected " + type];
}


export const types = {
	"any": true,
	"num": "any",
		"float":"num",
		"int":"num",
	"bool": "any",
}

export function compatibleTypes(type1,type2) {
	if (type1 == type2) {
		return true;
	}
	if (types[type1] == type2 || types[type2] == type1) {
		return true;
	}
}

export function pfloat(input) {
    var [intpart,rem,err] = parseWhileToken(input,/\d/);
    if (err) return typeError("Float",rem);
		
    var [_,rem2,err] = parseLiteral(rem, ".");
    if (err) return typeError("Float",rem);

    var [frac,rem3,err] = parseWhileToken(rem2,/\d/);
    if (err) return typeError("Float",rem);
	
    var val = parseFloat(intpart + "." + frac);
    if (isNaN(val)) {
        return typeError("Float",rem);
    }
    return [{ type: "float", val: val }, rem3]
}

export function phex(input) {
    
	var [_,rem,err] = parseLiteralToken(input, "0x");
    if (err) return typeError("Hexadecimal Number",rem);

    var [hex, rem2,err] = parseWhile(rem, /[\da-fA-F]/);
	if (err) return typeError("Hexadecimal Number",rem);
	
    var val = parseInt("0x" + hex);
    if (isNaN(val)) {
        return typeError("Hexadecimal Number",rem);
    }
    return [{ type: "int", val: val }, rem2]
}

export function pint(input) {
    //var [num, rem, err] = phex(input);
	//if (err) {
		var [num,rem,err] = parseWhileToken(input,/\d/);
		if (err) return typeError("Integer",rem);
	//}
	var val = parseInt(num);
    if (isNaN(val)) {
        return typeError("Integer;",rem);
    }
	
    return [{ type: "int", val: val }, rem]
}

/** Parse any number */
export function pnum(input) {

	var [num, rem, err] = pint(input);

	if (err) return typeError("Number",rem);
    return [num,rem];
}