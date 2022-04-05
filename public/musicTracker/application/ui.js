import {TableNode,InstrumentNode,LabelNode, td} from "./nodes.js"

class MTApp {
	constructor() {
		var data = {
			name: "Square Wave",
			data: [
				{ note: "c4", inst: 1, vol: 0, fx1: 0x0CC, fx2: 1 },
				{},
				{},
				{},
				{ note: "d4", inst: 1, vol: 0, fx1: 0x0CC},
				{},
				{ note: "e4", inst: 1, vol: 0, fx1: 0x0CC},
				{},
				{},
				{},
				{},
				{ note:"BAR"},
				{},
				{},
				{ note: "f4", inst: 1, vol: 0, fx1: 0x0CC, fx2: 0x207 }
			]
		}

		this.table = new TableNode([
			[
				new td(new LabelNode(data.data.length)),
				new td(new InstrumentNode(data.name, data.data))
			]
		], {"class":"thing"})
	}
}

document.body.appendChild(new MTApp().table);