import * as TGL from './classes.js'

//Splitters are characters that split a token
const splitters = /[ 	\n"'`{}()[\]:;.=+-/*]/ //note that this starts with space tab, not just 2 spaces

//Possible character leximes- see getType
const leximes = [
	["quote", /'/], ["dbquote", /"/], ["backquote", /`/],
	["oc", /{/], ["cc", /}/],
	["ob", /\[/], ["cb", /\]/],
	["oPar", /\(/], ["cPar", /\)/],
	["colon", /:/], ["semicolon", /;/],
	["dot", /\./],          //Will try to match things listed higher first; so it'll match 'dot' before 'number' alphanum
	["equals", /=/],
	["operator", /[*+\-/<=>]/],
	["number", /[\d.]/],
	["alphanumeric", /[\w@]/], //It will also try to match the longest possible string on that type.
	["whitespace", /[ 	\n]/]
];


/** Figures out what k */
function getType(char, bufferType) {
	var lexime = leximes.find(e => e[0] == bufferType)
	if (lexime && lexime[1].test(char)) {
		//	console.log(`Quickfound; ${lexime[0]}`, 3)
		return bufferType;
	}
	for (const kv of leximes) {
		const key = kv[0];
		const value = kv[1];
		if (value.test(char)) {
			//	console.log(`"${char}" is "${key}" (${value})`, 3)
			return key;
		}
	}
	/*if (splitters.test(char)) {
		return; //Return nothing, it's just a splitter
	}*/

	//If we've gotten to here, it doesn't fit into any of our categories and therefore is illegal
	return "error";
}

export function lex(string) {
	console.log("Lex Started...");

	let out = [];

	let buffer = '';     // Chars are assembled into tokens here
	let bufferType = ''; // Type of token in buffer

	var stringMode = false;  //Whether we're in a string or not
	var stringDelimiter = '';// ` " or '; whatever ends this string

	for (var i = 0; i < string.length; i++) {

		//Get character
		var char = string[i];
		var type = getType(char, bufferType);

		if (stringMode) {
			if (type == stringDelimiter) {
				out.push({ type: "string", value: buffer });
				buffer = '';
				stringDelimiter = '';
				stringMode = false;
			} else {
				buffer += char;
			}
		} else {
			if (type == "error") {
				throw `LexError: Invalid Token at ${i}: \`${char}\``
			}

			if (type == "quote" || type == "dbquote" || type == "backquote") {
				//console.log("StringMode!")
				stringMode = true;
				stringDelimiter = type;
				if (buffer.length > 0) {

					out.push({ type: bufferType, value: buffer });
					buffer = '';
					bufferType = '';

				}
				continue; //Skip everything below and enter string mode
			}
			if (splitters.test(char)) {
				if (buffer.length > 0) {

					out.push({ type: bufferType, value: buffer });
					buffer = '';
					bufferType = '';

				}
				if (type != "whitespace") {
					out.push({ type: type });
				}
			} else {
				if (buffer.length == 0) {
					bufferType = type;
				}
				buffer += char;
			}
		}
	}
	if (buffer.length > 0) {
		out.push({ type: bufferType, value: buffer })
		buffer = ''; //Clear it just for good measure
		bufferType = '';
	}
	out.push({ type: 'EOF' });

	console.log("Lex Complete!")

	return out;
}

const constructors = {
	"text": [
		"p",
		"h1",
		"h2",
		"h2",
		"h4",
		"h5",
		"h6"
	],
	"button": {},
	"container": {}
}

function hasProperty(object, property) {
	if (Array.isArray(object)) {
		if (object.includes(property)) {
			return true;
		}
	} else {
		if (object[property] !== undefined) {
			return true;
		}
	}
	return false;
}

function validTreePath(path, tree) {
	console.log(path)
	var o = tree;
	for (var i = 0; i < path.length; i++) {
		if (!hasProperty(o, path[i])) {
			return false;
		}
		o = o[path[i]];
	}
	return true;
}

function resolveTreePath(path, tree) {
	var o = tree;
	for (var i = 0; i < path.length; i++) {
		o = o[path[i]];
	}
	return o;
}

function assert(condition, failmessage) {
	if (condition) {
		return true;
	}
	throw failmessage;
}

export function parse(tokens) {
	var AST = [];
	Object.defineProperty(AST, "_currentElement", { get: () => { return AST[AST.length - 1] }, set: (v) => { AST[AST.length - 1] = v } })
	var i = -1;
	var token = {};

	const isValid = {
		text: () => { assert(token.type == "string", "SyntaxError: Expected String"); return token.value },
		button: () => { assert(token.type == "string","SyntaxError: Expected String"); return token.value },
		container: () => { return isSubTGL(); }
	}

	function validateElementContent(path) {
		var va = isValid;
		var i = 0;
		while (true) {
			if (va[path[i]]) {
				va = va[path[i]];
				i++;
			} else {
				break
			}
		}
		return va();
	}

	function validateCSS(v) {
		//Implement this
		return true
	}

	function isSubTGL() {
		//Implement this
		var depth = 1;
		var stokens = [];
		console.log("Grabbing sub-TGL")
		while (depth > 0) {
			if (token.type == "oPar") {
				depth++
			} else if (token.type == "cPar") {
				depth--
			}
			stokens.push(token);
			nextToken()
		}
		prevToken();
		prevToken();
		stokens.pop(); //Remove final tokens
		stokens.push({ type: "EOF" })
		console.log("Sub-TGL grabbed, making recursive call")
		return parse(stokens);
	}

	function nextToken() {
		i++;
		token = tokens[i];
		console.log(token)
		return token;
	}

	function prevToken() {
		i--;
		token = tokens[i];
		console.log("Reversed to " + JSON.stringify(token))
		return token;
	}

	function tokenIsConstructor() {
		assert(token.type == "alphanumeric", "SyntaxError: Expected element constructor.");

		//Get element name
		var expected = "alphanumeric";
		var elementName = [];

		while (token.type == expected) { //Names are just alphanum tokens alternating with . tokens
			console.log(token.type, expected)
			if (expected == "alphanumeric") {
				elementName.push(token.value);
				expected = "dot";
				nextToken();
			} else if (expected == "dot") {
				expected = "alphanumeric";
				nextToken();
			}
			console.log(token.type, expected)
		}
		assert(validTreePath(elementName, constructors), "Invalid element.")
		console.log("valid element constructor name");
		AST.push({ eName: elementName });

		//nextToken();
		assert(token.type == "oPar", `SyntaxError: Expected open parenthesis, got ${token.value ? `'${token.value}' (${token.type})` : token.type}`);

		nextToken();

		assert(AST._currentElement.content = validateElementContent(elementName));
		nextToken();

		assert(token.type == "cPar", "SyntaxError: Expected closing parenthesis.")
		nextToken();
		if (token.type == "oc") {
			//Validate style/property information
			console.log("Checking element style");

			var style = [];
			var depth = 1
			while (depth > 0) {
				nextToken();
				if (token.type == "oc") depth++
				else if (token.type == "cc") depth--
				style.push(token);
			}

			validateCSS(style);

			console.log("valid element style");
			AST._currentElement.style = style;
		} else {
			prevToken();
		}

		console.log("valid element!")
		return true;
	}

	nextToken();
	for (i; i < tokens.length && token.type != "EOF";) { //Loosely loop through tokens
		console.log(token.type)
		assert(tokenIsConstructor());
		nextToken();
	}
	console.log("Done!")
	return AST
}