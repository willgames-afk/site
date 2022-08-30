const settings = {
	blogCardsToLoad: 5,
	blogCardsURL: '/blog/cards/'
}


//UPDATERS- These update page content dynamically
function updateLocalhostDetector() {
	try {
		if (location.port && location.hostname == 'localhost') {
			console.log('Locally Hosted!')
			document.getElementById('localhost-detector').innerHTML = 'Locally Hosted on Port ' + location.port + '!'
		} else if (location.hostname !== 'localhost') {
			document.getElementById('localhost-detector').innerHTML = `Online and hosted at ${location.hostname}`
		}
	}
	catch {

	}
}
function updateColorButtons() {
	try {
		const buttons = document.querySelectorAll('#content .projects .links a');
		const color = document.getElementById('colorInput').value;
		const rgb = hextorgb(color);
		if (rgb.r + rgb.g + rgb.b >= (255 * 3 / 2)) {
			for (i = 0; i < buttons.length; i++) {
				buttons[i].style['background-color'] = color;
				buttons[i].style.color = '#000000';
			}
		} else {
			for (i = 0; i < buttons.length; i++) {
				buttons[i].style['background-color'] = color;
				buttons[i].style.color = '#FFFFFF';
			}
		}
	} catch {
		return
	}
}

//LOADERS- These load external content after the rest of the page has loaded.
function loadBlogPosts() {
	var select = document.querySelector("select.posts");
	//alert(select.value)
	
	var req = new XMLHttpRequest();
	console.log(`getting: ${location.origin + `/blog/cards/?sort=${select.value}&n=10`}`)
	req.open("GET", location.origin + `/blog/cards/?sort=${select.value}&n=10`);
	req.addEventListener("loadend",(e) => {
		//alert(req.responseText);
		//alert("HI!")
		//alert(req.responseText)
	
		console.log(req.responseText);
		var resp = JSON.parse(req.responseText);
		var el = document.querySelector("div.posts");
		//alert(el)
		el.innerHTML = ""
		for (var i=0;i<resp.length;i++) {
			
			el.innerHTML += resp[i]//.replace(/\\n/,"\n").replace(/\\t/,"\t").replace();
		}
		window.noms.resize();
	})
	req.send();
}

//HELPERS- helper functions to make everything else run smoothly
function hextorgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

//ONLOADS- These run when the page loads and do things like triggering loaders or updaters.
function onDOMLoad() {
	updateLocalhostDetector();
	updateColorButtons();
}
function onFullLoad() {
	loadBlogPosts();
	document.querySelector("select.posts").addEventListener("input",loadBlogPosts);
}


window.addEventListener("DOMContentLoaded", onDOMLoad);
window.addEventListener("load", onFullLoad)