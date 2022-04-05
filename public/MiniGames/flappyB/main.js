var canvas = document.getElementById('flappyCanvas');
canvas.width = 300
canvas.height = 100
var ctx = canvas.getContext('2d');
var player = {y:0,color:'rgb(0,0,0)'};
var walls = [];
var stopLoop = false
function render() {
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = player.color
    ctx.fillRect(20,player.y,20,20)
}
function update() {
    player.y += 1;
    if (player.y > canvas.height) {
        stopLoop = true
    }
}
function gameLoop() {
    update();
    render();
    if (!stopLoop) {
        console.log('Loop Complete!')
        requestAnimationFrame(gameLoop)
    }
}
requestAnimationFrame(gameLoop)