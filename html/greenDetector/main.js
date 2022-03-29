window.addEventListener("load", run)
function run() {
	const constraints = { video: true }
	navigator.mediaDevices.getUserMedia(constraints)
		.then(stream => {
			var video = document.createElement("video");
			video.srcObject = stream;
			video.muted = true; //Not that it should have any audio...
			var canvas = document.getElementById("output");
			var ctx = canvas.getContext("2d");
			function mainloop() {
				requestAnimationFrame(mainloop.bind(this))
				ctx.drawImage(video,0,0);
				ctx.fillStyle = "red"
				var image = ctx.getImageData(0,0,canvas.width,canvas.height);
				var greenLocations = [];
				for (var x=0;x<image.width;x++) {
					for (var y=0;y<image.height;y++) {
						const cp = (y * image.width + x) * 4
						var greenishness = image.data[cp + 1] - (image.data[cp] + image.data[cp + 2]) / 2; //How green a given pixel is
						if (greenishness < 20) { //Green-ness threshold
							greenishness = 0;
						} else {
							greenishness = 255;
							greenLocations.push([x,y]);
						}

						image.data[cp + 0] = greenishness;
						image.data[cp + 1] = greenishness;
						image.data[cp + 2] = greenishness;
					}
				}
				ctx.putImageData(image,0,0)

				ctx.fillText(`Green Pixel Percent: ${greenLocations.length/image.data.length}`,0,10)
				if (greenLocations.length/image.data.length < 0.003) {
					return
				}

				avg = [0,0]
				dist = 0
				for (var i=0;i<greenLocations.length;i++) {
					avg[0] += greenLocations[i][0]
					avg[1] += greenLocations[i][1]
				}
				avg[0] /= greenLocations.length;
				avg[1] /= greenLocations.length;

				for (var i=0;i<greenLocations.length;i++) {
					xdist = (greenLocations[i][0] - avg[0]) * (greenLocations[i][0] - avg[0]);
					ydist = (greenLocations[i][1] - avg[1]) * (greenLocations[i][1] - avg[1]);
					dist += Math.sqrt(xdist,ydist);
				}
				dist /= greenLocations.length;


				ctx.beginPath();
				ctx.arc(avg[0],avg[1],10,0,2*Math.PI);
				ctx.fill();

				ctx.fillText(`Average distance from Average: ${dist}`,0,30)

				if (dist > 80) {
					return;
				}

				
			}
			video.onloadedmetadata = () => {
				console.log(video)
				video.play();
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				requestAnimationFrame(mainloop);
			}
			//document.body.appendChild(video)
		})
		.catch(err => {
			alert("Failed; " + err)
		})
}