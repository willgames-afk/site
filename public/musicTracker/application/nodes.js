export class TableNode extends _table {constructor(data, attrs) {super(data, attrs)}}
function _table(data, attrs) {
	var self = document.createElement("table");
	for (var i = 0; i < data.length; i++) {
		var rw = document.createElement("tr");
		for (var j = 0; j < data[i].length; j++) {
			rw.appendChild(data[i][j]);
		}
		self.appendChild(rw);
	}
	for (var attr in attrs) {
		self.setAttribute(attr, attrs[attr]);
	}
	return self;
}

export class LabelNode extends TableNode {
	constructor(length) {
		var dat = [[new td("\u00a0")]];
		for (var i = 0; i < length; i++) {
			dat.push([new td(formatNumber(i.toString(16), true, 2))]);
		}
		super(dat, {"class": "label"});
	}
}

export class InstrumentNode extends TableNode {
	constructor(name, data) {
		var tabdat = [
			[
				new td(name, { "colspan": "4", "class": "channelname" })
			]
		];
		var fxlevel = 1;
		if (data[0].fx2) {
			fxlevel++;
			tabdat[0].push(new td("fx2", { "class": "fxlabel" }));
			if (data[1].fx3) {
				fxlevel++;
				tabdat[0].push(new td("fx3", { "class": "fxlabel" }));
				if (data[1].fx4) {
					fxlevel++;
					tabdat[0].push(new td("fx4", { "class": "fxlabel" }));
				}
			}
		}
		const attrs = { "contenteditable": "" }
		for (var i = 0; i < data.length; i++) {
			var row = [];
			var d = data[i];
			row.push(
				new td(formatNote(d.note), attrs),
				new td(formatNumber(d.inst, false,2), attrs),
				new td(formatNumber(d.vol, false,1), attrs),
				new td(formatNumber(d.fx1,true,3), attrs)
			)
			if (fxlevel > 1) {
				row.push(new td(formatNumber(d.fx2,true,3), attrs))
				if (fxlevel > 2) {
					row.push(new td(formatNumber(d.fx3,true,3), attrs))
					if (fxlevel > 3) {
						row.push(new td(formatNumber(d.fx4,true,3), attrs))
					}
				}
			}

			tabdat.push(row);
		}
		super(tabdat, {"class": "channel"});
		this.name = name;
	}
}

export class td extends _td {constructor(content, type, attrs){super(content,type/*, attrs*/)}}
function _td(content, type, attrs={}) {
	var self = document.createElement("td");
	setAttributes(self, type)
	if (content) {
		/*if (type) {
			content = format(type, content);

		}*/
		if (typeof content == "string") {
			self.appendChild(document.createTextNode(content));
		} else {
			self.appendChild(content);
		}
	}
	return self;
}

function format(type, content) {
	switch (type) {
		case "noteoct":
			if (content.length == 3) {
				return content.toUpperCase();
			} else {
				return (content[0] + "-" + content[1]).toUpperCase();
			}
		case "decnum":
			if (typeof content == "number") {
				return content.toString(10).toUpperCase();
			} else {
				return content.toUpperCase();
			}
		case "hexnum":
			if(typeof content == "number") {
				return content.toString(16).toUpperCase();
			} else {
				return content.toUpperCase();
			}

	}
}
function getAttrs(type) {

}

function setAttributes(element, attrs) {
	for (var attr in attrs) {
		element.setAttribute(attr,attrs[attr]);
	}
}

function formatNote(note) { //     c4 g#6 -> 000 C-4 G#6
	if (!note) {
		return `---`;
	}
	if (note == "BAR") {
		note="—"//Special end-of-guarded-area character (U+0096)
	}
	if (note.length == 2) {
		return `${note[0].toUpperCase()}-${note[1]}`
	}
	return note.toUpperCase();
}

function formatNumber(number, hex=false, padlen=1, padright = false) {
	if (number === undefined) {
		return "".padStart(padlen,"-");
	}
	if (hex) {
		number = number.toString(16);
	}
	if (padright) {
		return number.toString().padEnd(padlen, "0").toUpperCase()
	}
	return number.toString().padStart(padlen, "0").toUpperCase();
}