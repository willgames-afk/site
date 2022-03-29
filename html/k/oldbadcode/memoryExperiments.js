export function dumbfunction() {} 

var memory = ["NULL!!"];

function showMemory() {
	console.log(memory);
}

function assignVar() {
	memory.push(0);
	memory.push(100);
	return memory.length - 2;
}

function setVar(nvar, addr) {
	memory[nvar] = addr;
	return 
}

function assignInt(v) {
	memory.push(v);
	memory.push(0);
	return memory.length - 2;
}

function deref(addr) {
	var pos = addr;
	while(memory[pos+1] == 100) {
		pos = memory[pos];
	}
	return memory[pos];
}

var a = assignVar();
console.log ("int a")
console.log("A has address", a, "and dereferences to", deref(a))
showMemory()

var b = assignVar();
console.log ("int b")
console.log("B has address", b, "and dereferences to", deref(b))
showMemory()

setVar(b,assignInt(100000));
console.log ("b = 10000")
console.log("B still has address", b, "and dereferences to", deref(b))
showMemory()

setVar(a,b);
console.log ("A = B")
console.log("A now dereferences to", deref(a))
showMemory()

setVar(b, assignInt(294));
console.log ("b = 294")
console.log("B dereferences to", deref(b), "and A dereferences to", deref(a))
showMemory()

setVar(a, assignInt(69));
console.log("a = 69");
console.log("B dereferences to", deref(b), "and A dereferences to", deref(a))

