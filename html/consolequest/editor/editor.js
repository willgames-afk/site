class CQEditor {
	constructor(htmlElement) {
		this.map = {
			data: [

			],
			startText: "",
			directions: {
				"north": { "x": 0, "y": -1, "opp": "south" },
				"south": { "x": 0, "y": 1, "opp": "north" },
				"east": { "x": 1, "y": 0, "opp": "west" },
				"west": { "x": -1, "y": 0, "opp": "east" }
			}
		}
		this.player = {
			x: 0,
			y: 0,
			lastMove: 'not',
			inventory: {}
		};
		this.items = {};
		this.container = htmlElement;

		this.width = 10;

		this.textarea = document.createElement("textarea");
		this.textarea.addEventListener("keypress", this.onkey);
		this.textarea.addEventListener("click", this.onclick);
		for (var y = 0; y < this.width; y++) {
			for (var x = 0; x < this.width; x++) {
				this.textarea.value += " ";
			}
			this.textarea.value += "\n"
		}

		this.container.appendChild(this.textarea);
		this.container.appendChild(document.createTextNode("adfasdfasdf"))
		document.body.addEventListener("keydown", this.onkey.bind(this))
		//document.body.addEventListener("keypress", this.onkey.bind(this))

		this.selected = { x: -1, y: -1 };
	}
	onclick() {
		var caret = getCaret(this);
		setCharSelect(this, caret);
	}
	onkey(e) {
		var caret = getCaret(e.target);
		switch (e.key) {
			case "ArrowUp":
				e.preventDefault();
				setCharSelect(e.target, caret - this.width - 1);
				return;
			case "ArrowDown":
				e.preventDefault();
				setCharSelect(e.target, caret + this.width + 1);
				return;
			case "ArrowLeft":
				e.preventDefault();
				setCharSelect(e.target, caret - 1);
				return;
			case "ArrowRight":
				e.preventDefault();
				setCharSelect(e.target, caret + 1);
				return;
		}

		var key = e.key;
		var text = e.target.value;

		if (e.key.length == 1) {
			e.preventDefault();
			e.target.value = text.substring(0, caret) + key + text.substring(caret + 1);
			setCharSelect(e.target, caret);
		}
	}
	onkeyup(e) {
		//Fix textarea spacing-
	}
	static addEditor(htmlElement) {
		return new CQEditor(htmlElement)
	}
}
window.addEventListener('load', (e) => {
	var d = document.getElementsByClassName("mainbox")[0]
	CQEditor.addEditor(d);
})

function getCaret(el) {
	if (el.selectionStart) {
		return el.selectionStart;
	} else if (document.selection) {
		el.focus();
		var r = document.selection.createRange();
		if (r == null) {
			return false;
		}

		var re = el.createTextRange(),
			rc = re.duplicate();
		re.moveToBookmark(r.getBookmark());
		rc.setEndPoint('EndToStart', re);

		return rc.text.length;
	}
	return false;
}
function setCharSelect(elem, caretPos) {
	if (elem != null) {
		if (elem.createTextRange) {
			var range = elem.createTextRange();
			range.moveEnd('character', caretPos + 1);
			range.moveStart('character', caretPos);
			range.select();
		} else if (elem.selectionStart) {
			elem.focus();
			console.log(elem)
			elem.setSelectionRange(caretPos, caretPos + 1);

		}
	}
}