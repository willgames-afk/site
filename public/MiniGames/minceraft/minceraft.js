class Vec2  {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
	add(x=0,y=0) {
		return new Vec2(this.x + x, this.y + y);
	}
	aadd(x=0,y=0) {
		this.x += x;
		this.y += y;
		return this;
	}
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var mouse = {};
var mince = {
	rafts: [],
	fragments: [],
	mouseLineTable: [],
	create(x, y, s, c) {
		mince.rafts.push({
			pos: new Vec2(x,y),
			xVel: (Math.random() * 20) - 10,
			yVel: -10,
			si: s,
			co: c,
			rot: Math.round(Math.random() * 360 * (Math.PI / 180))
		});
	},
	render(rafts, fragments, mouseLineTable) {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
		for (i = 0; i < rafts.length; i++) {
			data = rafts[i]
			ctx.beginPath();
			ctx.save()
			ctx.fillStyle = data.co
			ctx.translate(data.x, data.y)
			ctx.rotate(data.rot)
			ctx.fillRect(0, 0, data.si, data.si * 1.88)
			ctx.restore()
			ctx.arc(data.pos.x, data.pos.y, 10, 0, 2 * Math.PI)
			ctx.fill();
		}
		for (fragm in fragments) {

		}
		ctx.beginPath()
		ctx.fillStyle = 'rgb(0,0,0)'
		ctx.moveTo(mouseLineTable[0].x, mouseLineTable[0].y);
		for (segment of mouseLineTable) {
			ctx.lineTo(segment.x, segment.y)
		}
		ctx.stroke();
	},
	main() {
		mince.process(mouse);
		mince.render(mince.rafts, mince.fragments, mince.mouseLineTable);
		requestAnimationFrame(mince.main);
	},
	process(mouse) {
		var len = this.rafts.length;
		mince.mouseLineTable.push(mouse);
		if (mince.mouseLineTable.length > 10) {
			mince.mouseLineTable.shift()
		}

		var currentLine = [mouse,this.mouseLineTable[this.mouseLineTable.length-2]];

		for (i = 0; i < len; i++) {
			var data = mince.rafts[i]
			if (!data) {
				continue;
			}
			//gravity
			if (data.yVel < 30) {
				data.yVel += 0.1
			}
			//apply velocities
			data.pos.aadd(data.xVel, data,yVel);
			//get rid of stuff too far off the screen
			if (!mince.inCanvas(data.pos.x, data.pos.y, 0)) {
				mince.rafts.splice(i, 1)
			}
		}

	},
	rIC(x, y, padding) {
		if (x && y) {
			return [((Math.random() * canvas.width - 2 * padding) + padding), ((Math.random() * canvas.height - 2 * padding) + padding)]
		}
		if (y) {
			return ((Math.random() * canvas.height - 2 * padding) + padding)
		}
		if (x) {
			return ((Math.random() * canvas.width - 2 * padding) + padding)
		}
	},
	inCanvas(x, y, padding) {
		if (x < 0 - padding || x > canvas.width + padding || y < 0 - padding || y > canvas.height + padding) {
			return false
		} else {
			return true
		}
	},
	intersect(pa1, pa2, pb1, pb2) {
		//First, we convert both lines to y=mx+b
		var m1 = (pa1.x - pa2.x) / (pa1.y - pa2.y);
		var b1 = -m1 * pa1.x + pa1.y;

		var m2 = (pb1.x - pb2.x) / (pb1.y - pb2.y);
		var b2 = -m2 * pb1.x + pb1.y;

		//If the lines are parallel (slopes are the same), they don't cross.
		if (m1 == m2) {
			return false;
		}

		//Assuming they're crossing, there's a point where the y value of each line is the same.
		//Thus, we can create this equation
		// m₁x+b₁=m₂x+b₂
		// Then, we can solve for x which gives us this equation
		var x = (b2-b1)/(m1-m2)

		//But this assumes that the lines extend infinitely- we need to make sure the point is actually on the lines

		if (x < Math.min(pa1.x,pa2.x) ||
			x > Math.max(pa1.x,pa2.x) ||
			x < Math.min(pb1.x,pb2.x) ||
			x > Math.max(pb1.x,pb2.x)) {
			return false;
		}

		//Now that we know the x coord of the equation, we can find the y by using the equation for one of the lines.
		var y = m1 * x + b1

		//And validate it
		if (y < Math.min(pa1.y,pa2.y) ||
			y > Math.max(pa1.y,pa2.y) ||
			y < Math.min(pb1.y,pb2.y) ||
			y > Math.max(pb1.y,pb2.y)) {
			return false;
		}

		//If all of these checks have passed, we can confirm a collision.

		return new Vec2(x,y);
	}
};

window.onload = function () {
	function makeRaft() {
		mince.create(mince.rIC(true, false, 100), canvas.height, 100, 'rgb(10,20,3)');
		setTimeout(makeRaft, Math.random() * 1000);
	}
	window.setTimeout(function (e) {
		makeRaft();
	}, 1000)

	mince.main();
};

var mouseX = 0, mouseY = 0;

window.addEventListener("mousemove", (e) => {
	window.mouse = new Vec2(e.x, e.y);
})