//import { TextIO } from "../../text-input-engine/main.js"
//import { parse } from "./parsing/booleanExpressions.js"
//import { interperet } from "./interpereter.js"
//import { pInt } from "./parsing/potassium.js"
import {dumbfunction} from "./potassium.js"

/*function printNicely(ast) {
    //console.log(ast
    if (Array.isArray(ast)) {
        var s = "";
        for (var i=0;i<ast.length;i++) {
            s += printNicely(ast[i]) + "\n";
        }
        return s
    }

    switch (ast.type) {
        case "int":
        case "float":
        case "bool":
        case "var":
            return ast.val.toString();

       /* case "var":
            if (!variables[ast.val]) {
                throw `Variable ${ast.val} is not defined!`
            }
            return variables[ast.val];*

        case "assign":
            //console.log(ast.val[0].val)
            return `Assign variable ${ast.val[0].val} to ${printNicely(ast.val[1])}`
            break;

        case "expression":
            //console.log(ast.val[0].val)
            switch (ast.val[0].val) {
                case "Add":
                    return `(${printNicely(ast.val[1])} + ${printNicely(ast.val[2])})`

                case "Sub":
                    return `(${printNicely(ast.val[1])} - ${printNicely(ast.val[2])})`

                case "Mul":
                    return `(${printNicely(ast.val[1])} * ${printNicely(ast.val[2])})`

                case "Div":
                    return `(${printNicely(ast.val[1])} / ${printNicely(ast.val[2])})`
            }
    }
}


//----------------Main Function ------------//
new TextIO(
    (input) => {
        var ast = parse(input);
        console.log(ast)
        if (typeof ast == "string") {
            return ast; //It's an error message
        }
        return `${printNicely(ast)}\n${JSON.stringify(interperet(ast), null, "	")}\n`

    }, { runAuto: true }
)*/