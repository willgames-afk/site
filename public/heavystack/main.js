function resizeTA(textarea) {
	textarea.style.height = "0px";
	if (textarea.scrollHeight > 15) {
		textarea.style.height = textarea.scrollHeight + 'px';
	} else {
		textarea.style.height = 15 + px;
	}
}



var running = false;

var out = document.getElementById('output')
var inp = document.getElementById('input')
var button = document.getElementById('runstop')
var exp  = document.getElementById('export')
inp.addEventListener("keydown",function (e){
	//console.log(e)
	if (e.key == "Tab") {
		//console.log("IT WAS A TAB")
		e.preventDefault();
		var start = this.selectionStart;
    	var end = this.selectionEnd;

    	// set textarea value to: text before caret + tab + text after caret
    	this.value = this.value.substring(0, start) +
      		"\t" + this.value.substring(end);

    	// put caret at right position again
    	this.selectionStart =
      		this.selectionEnd = start + 1;
	}
	
	localStorage.program = this.value;
})

inp.addEventListener("input", function(e){
	resizeTA(this);
})

exp.addEventListener("click", ()=>{
	console.log("DOWNLOAD")
	var downloader = document.createElement("a");
	downloader.setAttribute("href","data:text/plain;charset:utf-8," + encodeURIComponent(localStorage.program));
	var line1 = localStorage.program.split("\n")[0].replace(/[^a-zA-Z0-9\-_\[\] ]/g, "");
	downloader.setAttribute("download", `${line1}.txt`);
	if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        downloader.dispatchEvent(event);
    }
    else {
        downloader.click();
    }
})


button.addEventListener("click", onRun.bind(this));

inp.value = localStorage.program ? localStorage.program : "";
resizeTA(inp);

async function onRun() {
	if (!running) {
		running = true;
		button.innerHTML = "Stop";
		out.value = "";
		resizeTA(out);

		/*
		try {
		console.log(validate(inp.value));
		} catch (e) {
			console.log (e)
		}*/

		out.value = await run(inp.value);
		if (out.value.length == 0 ) {
			if (running) {
				out.value = "(Program terminated successfully with no output)"
			} else {
				out.value = "(Program was forcibly stopped)"
			}		
		} 
		resizeTA(out);
		running = false;
		button.innerHTML = "Run";
	} else {
		running = false;
		button.innerHTML = "Run";
	}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run(code) {
    var stack = [];
    var out = "";
    function po() { //Pop something off the stack
        if (stack.length > 0) {
            return stack.pop();
        } else {
            return 0;
        }
    }
    function psh(v) {
        if (v == 0 && stack.length == 0) {
            return; //Putting 0s on the bottom of the stack is pointless; it sits on an infinite pile of them
        }
        stack.push(v);
    }
    function nps() { //Pop something of the stack, and convert blobs to 0s 
        var res = po();
        if (Array.isArray(res) || isNaN(res)) {
            return 0;
        }
        return res;
    }
    var ACC = Math.random();
    console.log(`Start: ACC:${ACC} STACK:`)
    console.log(code)
    var skipDepth = 0;
    var skipType = null;

	var lt = Date.now();
	
    for (var i=0; (i<code.length) && running; i++) {
		if (Date.now() - lt > 500) {
			await sleep(0); //Make it so that infinite loops don't crash the page
			lt = Date.now();
		}
		
		if (i < 0) {
			skipDepth = 0;
			i=0;
		}

        if (skipDepth > 0) {
            if (skipType == "[]") {
                if (code[i] == "]") {
                    skipDepth--;
                } else if (code[i] == "[") {
					skipDepth++;
				}              
            } else {
                if (code[i] == "{") {
                    skipDepth--;
                } else if (code[i] == "}") {
					skipDepth++;
				}
				if (skipDepth !== 0) {
					i-=2;
				}
            }
			continue;
        }
        
        switch (code[i]) {
            case ">":
                ACC = po();
                break;
            case "<":
                psh(ACC);
                break;
            case '.':
                if (Array.isArray(ACC) || isNaN(ACC)) {

					//Blobs and NaNs should be treated like 0s, and 0 + 1 is 1
					ACC = 1;
                } else {
                    ACC++;
                }
                break;
            case ",":
                if (Array.isArray(ACC)) {
                    psh(ACC.pop());
                    if (ACC.length == 1) {
                        ACC = ACC.pop();
                    }
                } else {
					if (isNaN(ACC)) {
						ACC = -1;
					}
                    ACC--;
                }
                break;
            case "^":
                /*if (Array.isArray(ACC)) {
                    console.log(String.fromCharCode(0));
                    out += String.fromCharCode(0);
                }*/
                console.log(String.fromCharCode(ACC) + `(${ACC})`);
                out += String.fromCharCode(ACC);
                break;
            case "[":
                if (ACC === 0 || ACC.length == 2 || isNaN(ACC)) {
                    //console.log("Zooming!")
                    skipDepth++;
                    skipType = "[]";
                }
                break;
            case "}":
                skipDepth++;
                skipType = "{}";
				//console.log("!gnimooZ")
                i-= 2;
                break;
            case "+":
                ACC = nps() + nps();
                break;
            case "-":
                ACC = nps() - nps();
                break;
            case "*":
                ACC = nps() * nps();
                break;
            case "/":
                ACC = nps() / nps();
				if (ACC == Infinity) {
					ACC = NaN;
				}
                break;
            case "%":
                ACC = nps() % nps();
                break;
            case "$":
                if (stack.length == 0) {
                    break;
                }
                b = po();
                a = po();
                psh(b);
                psh(a);
                break;
            case ":":
                var p = 0;
                var blob = [];
                do {
                    var val = po();
                    blob.push(val);
                } while (!isNaN(val));
				if (Array.isArray(ACC)) {
					ACC.unshift(...blob/*.reverse()*/);
				} else {
           			ACC = blob//.reverse();
                	if (ACC.length == 1) {
                    	ACC = ACC[0]
                	}
				}
                break;
                
        }        

        //console.log(`Code:${code[i]} ACC:${ACC} STACK: ${stack}`)
    }
	console.log(`End: STACK: ${printStack(stack)} ACC: ${ACC}`)
    return out
}

function printStack(stack) {
	//console.log(stack)
	var out = "";
	if (Array.isArray(stack) && stack.length == 0) {
		return "[Empty]"
	}
	
	for (var i=0;i<stack.length-1;i++) {
		if (Array.isArray(stack[i])) {
			out += `[${printStack(stack[i].reverse())}], `;
		} else {
			out += stack[i] + ", "
		}
	}
	//i++;
	if (Array.isArray(stack[i])) {
		out += `[${printStack(stack[i].reverse())}]`;
	} else {
		out += stack[i]
	}
	
	return out;
}