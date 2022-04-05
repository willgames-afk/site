window.addEventListener("load", init)

function init() {
	document.body.oncontextmenu = (e) => {e.preventDefault()}; //Prevent Right-Clicks
	var input = document.getElementById("in")
	input.addEventListener("input",()=>{
		document.getElementById("out").srcdoc = document.getElementById("in").value
	})
	input.spellcheck = false;
	input.autofocus = true;
}