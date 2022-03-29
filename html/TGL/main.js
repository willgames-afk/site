import { TextIO } from "../text-input-engine/main.js";
import { lex, parse } from "./modules/parser.js"

new TextIO(
(input) => {
	//Get rid of loading box
	document.getElementById("loadingMessage").style.display = "none";
	return JSON.stringify(parse(lex(input))).replace(/},/g, '},\n')
	
}, { runImmediate: true, runAuto:true, defaultInputFile: "./testProgram.tgl", controls: true})