console.group('Loading and Initializing...')
var canvas = document.getElementById('flappycanvas');
canvas.width = 800;
canvas.height = 600;

var ctx = canvas.getContext('2d');
ctx.font = '30px Arial'
ctx.imageSmoothingEnabled = false;



console.log('Loading Assets...')
var background = new Image()
background.src = 'assets/background.png'
background.scale = 0.28;
var ground = new Image()
ground.src = 'assets/ground.png'
ground.scale = 0.14
ground.onload = function() {
    //ctx.drawImage(ground,0,canvas.height-184,256,184)
}
var judoka = {
    frames: {
        up: new Image(),
        middle: new Image(),
        down: new Image(),
        current: 'down',
        scale: 0.13
    },
    x: canvas.width/2,
    y: canvas.height/2,
}
judoka.frames.up.src = 'assets/flappy-up.png'
judoka.frames.middle.src = 'assets/flappy-middle.png'
judoka.frames.down.src = 'assets/flappy-down.png'
var cables = {
    frames: {
        body: new Image(),
        end: new Image()
    },
    l: [

    ]
}
cables.frames.body.src = 'assets/yellow-cable-body.png'
cables.frames.body.scale = 0.60
cables.frames.end.src = 'assets/yellow-cable-top.png'
cables.frames.end.scale = 0.20

function aspectRatioScale(image, scaleRatio) {
    var height = canvas.height * scaleRatio
    var width = image.width * (height / image.height)
    var sx = width / image.width
    var sy = height / image.height

    var c = new OffscreenCanvas(width, height)
    var context = c.getContext("2d")
    context.drawImage(image, 0, 0, width, height)

    return c
}

function gameRender() {
    ctx.fillStyle = '#32c4df'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.drawImage(judoka.frames[judoka.frames.current],judoka.x,judoka.y)
}

function init() {
    //Scaling everything properly
    console.log('Scaling...')
    judoka.frames.up     = aspectRatioScale(judoka.frames.up,judoka.frames.scale)
    judoka.frames.middle = aspectRatioScale(judoka.frames.middle,judoka.frames.scale)
    judoka.frames.down   = aspectRatioScale(judoka.frames.down,judoka.frames.scale)
    cables.frames.body   = aspectRatioScale(cables.frames.body, cables.frames.body.scale)
    cables.frames.end    = aspectRatioScale(cables.frames.end,cables.frames.end.scale)
    background           = aspectRatioScale(background,background.scale)
    ground               = aspectRatioScale(ground,ground.scale)



    console.log('Done.')
    console.groupEnd()
}

window.onload = function() {
    init();
    gameRender();
}

