export function compile(code) {
	var output = "";
	function l(d) {output += d + "\n"}

	l(".section __TEXT,__text")
	l("	FINIT")
	
	for (var i=0;i<code.length;i++) {
		const char = code[i];
		switch(char) {
			case ""
		}
	}

	l("	mov eax, $2000001")
}