
export function TrackElement(notes) {
	var self = document.createElement("table"); //Create Table

	self._notes = notes;
	self.addNote = (note) => {

		console.log(note.html)
	
		var row = document.createElement("tr"); //Create row element
	
		var noteNumber = document.createElement("td"); //Create Note number label
		noteNumber.innerText = self.rows.length;         //Set its value

		row.appendChild(noteNumber);    //Add it to row
		row.appendChild(note);            //Add to row
	
		self.appendChild(row);
	}
	self._regenerateHTML = () => {
		self.innerHTML = "";
		for (var i = 0; i < self._notes.length; i++) { //Iterate through rows
			self.addNote(self._notes[i])
		}
	}

	console.dir(self)

	self._regenerateHTML();
	return self;
}

export function NoteElement (value, onComplete) {
	

	var self = document.createElement("span");
	self.innerText = value;
	self.keycount = 0;
	self.container = document.createElement("td");
	self.container.appendChild(self); //Confusing, I know. 

	self.select = () => {
		if (self.selected) return false;

		self.selected = true;
		self.keycount = 0;
		self.container.setAttribute("selected", '');
		document.body.addEventListener("keydown", self.keydown.bind(self));
	}

	self.container.addEventListener("click", self.select.bind(self));
	self.onComplete = onComplete;
	

	self.keydown = (e) => {
		console.log(`KEYPRESS ${self.keycount}, "${e.key}"`)

		if (self.keycount == 0) { //Key 1 is the key, ABCDEF or G

			if (/[a-gA-G]/.test(e.key) && e.key.length == 1) {
				self.innerText = e.key.toUpperCase() + '--';
				self.keycount++;
				/*var durEl = document.querySelector('[index ="' + element.getAttribute('index') + '"][class="duration"]');
				if (durEl.innerHTML == '--') {
					durEl.innerHTML = '01';
				}*/
			} else if (e.key == 'Backspace' || e.key == ' ' || e.key == '-') {
				self.innerText = '---'
				self._onComplete()
			}

		} else if (self.keycount == 1) {

			if (/[# -]/.test(e.key)) { //Key 2 is wether it's sharp or not (No flats supported yet)
				if (e.key == '#') {
					self.innerText = self.innerText[0] + '#-';
				} else {
					self.innerText = self.innerText[0] + '--';
				}
				self.keycount++;
			} else if (/[0-9]/.test(e.key)) { //If user types a number, skip ahead to Key 3
				self.innerText = self.innerText[0] + '-' + e.key;
				self.keycount++;
				self._onComplete();
			}

		} else if (self.keycount == 2) {

			if (/[0-9]/.test(e.key)) { //Key 3 is the Octave, 12345678 or 9
				self.innerText = self.innerText.slice(0, 2) + e.key;
				self._onComplete()
			}
		}
	}
	self._onComplete = ()=> {
		self.deselect();
		console.log("completed");
		self.onComplete();
	}

	self.deselect = () => {
		if (!self.selected) return false;
		self.selected = false;

		console.log(self)
		console.log(self.keycount)
		if (self.keycount != 2) {
			console.log('Incomplete!');
			self.innerHTML = '---';
		}
		self.container.removeAttribute("selected");
		document.body.removeEventListener("keydown", self.keydown.bind(self))
	}
	self.getNoteFormatted = ()=> {
		var s = self.innerText;
		return s[0] + (s[1] == "#" ? s[1] + s[2] : s[2]); //Ignore dashes
	}
	self.setNoteFromFormatted = (string) => {
		if (string.length == 2) {
			self.innerText = string[0] + '-' + string[1];
		} else {
			self.innerText = string;
		}
	}
	return self.container; //More convinient to work with internal span than external td
}
export function formatLikeNote(string) {
	if (string.length == 2) {
		return string[0] + '-' + string[1];
	}
	return string;
}
