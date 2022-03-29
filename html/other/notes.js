function convert() {
	var inp = document.getElementById("mcin");
	var outp = document.getElementById("mcout");
	var input = inp.value.replace(" ", "").split(",");
	console.log(input)
	var output = [];
	for (var i = 0; i < input.length; i++) {
		output.push(transpose("C2", parseInt(input[i])));
	}
	outp.value = output.join(", ");
}

function transpose(startNote, distance) {
	const notes = [
		"A",
		"A#",
		"B",
		"C",
		"C#",
		"D",
		"D#",
		"E",
		"F",
		"F#",
		"G",
		"G#"
	]
	startNote = startNote.split("");
	var note = startNote.shift();
	if (startNote[0] == "#") { //If new first element is #, it's part of the notename.
		note += startNote.shift();
	}
	var octave = parseInt(startNote);
	var startIndex = notes.indexOf(note);
	return notes[(startIndex + distance) % notes.length] + (octave + Math.floor((startIndex - 3 + distance)/12))
}