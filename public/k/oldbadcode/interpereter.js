export function interperet(ast) {
	var variables = {};
	function _interperet(ast) {
		console.log(ast)
		switch (ast.type) {
			case "int":
			case "float":
			case "bool":
				return ast.val;

			case "var":
				if (!variables[ast.val]) {
					throw `Variable ${ast.val} is not defined!`
				}
				return variables[ast.val];

			case "assign":
				console.log(ast.val[0].val)
				variables[ast.val[0].val] = _interperet(ast.val[1]);
				break;

			case "expression":
				console.log(ast.val[0].val)
				switch (ast.val[0].val) {
					case "Add":
						return _interperet(ast.val[1]) + _interperet(ast.val[2])

					case "Sub":
						return _interperet(ast.val[1]) - _interperet(ast.val[2])

					case "Mul":
						return _interperet(ast.val[1]) * _interperet(ast.val[2])

					case "Div":
						return _interperet(ast.val[1]) / _interperet(ast.val[2])
				}
                break;
            case "equation":
                break;
		}
	}

	try {
		for (var i = 0; i < ast.length; i++) {
			_interperet(ast[i]);
		}
		return variables;
	} catch (e) {
		console.error(e);
		return e;
	}
}

