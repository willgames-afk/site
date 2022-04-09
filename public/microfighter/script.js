var stillLoading = 4; //3 sound fx and the window
const audio = {
    pew: "audio_shot",
    explode1: "audio_explode1",
    explode2: "audio_explode2"
}

//LOADING
if (window.location.protocol == "file:") {
    console.log("Loaded from file://!")
    stillLoading = 1;
} else {
    loadSounds();
}
window.addEventListener("load", () => {
    console.log("PAGE LOAD")
    stillLoading--;
    console.log(stillLoading)
    if (stillLoading <= 0) {
        init();
    }
});

var sprites = { //Sprite data; X Y W H of all the sprites on the spritesheet
    player: [0, 0, 12, 13],
    playerShot: [13, 0, 2, 9],
    life: [0, 14, 6, 6],
    thiccboi: [0, 21, 45, 27],
    arrow: [19, 10, 13, 10],
    bug: [19, 0, 14, 9],
    alienShot: [13, 10, 4, 4],
    explosion: ["animated", [33, 10, 9, 9], [43, 9, 11, 11], [46, 21, 17, 18], [46, 40, 17, 17]],
    sparks: ["animated", [34, 0, 10, 8], [45, 0, 7, 8], [54, 0, 9, 8]],
    powerup: ["animated", [0, 49, 9, 12], [10, 49, 9, 12], [20, 49, 9, 12], [30, 49, 9, 12]]
}

const aliens = {
    thiccboi: 12,
    arrow: 2,
    bug: 4
}

var ctx;
var c;
const scale = 2;
const width = 320;
const height = 240;
var highscore = 0;
var audioContext;

function loadSprites() {
    const image = document.getElementById("spritesheet");

    function makeSprite(image, s) {
        if (s[0] == "animated") {
            return function (ctx, frame, x, y, r) {
                frame = Math.floor(frame) + 1

                if (r) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(r);
                    ctx.drawImage(image, ...s[frame], -s[frame][2] / 2, -s[frame][3] / 2, s[frame][2], s[frame][3]);
                    ctx.restore();
                } else {
                    ctx.drawImage(image, ...s[frame], x - s[frame][2] / 2, y - s[frame][3] / 2, s[frame][2], s[frame][3]);
                }
            }
        } else {
            return function (ctx, x, y, r) {
                if (r) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(r);
                    ctx.drawImage(image, ...s, -s[2] / 2, -s[3] / 2, s[2], s[3]);
                    ctx.restore();
                } else {
                    ctx.drawImage(image, ...s, x - s[2] / 2, y - s[3] / 2, s[2], s[3]);
                }
            }
        }
    }

    for (sprite in sprites) {
        console.log(`${sprite}: `, sprites[sprite])
        sprites[sprite].draw = makeSprite(image, sprites[sprite]);
    }
    sprites.spritesheet = image;
}

function loadSounds() {
    for (id in audio) {
        var req = new XMLHttpRequest();
        req.open("GET", audio[id] + ".mp3");
        req.responseType = "arraybuffer"
        req.addEventListener("loadend", onSuccess(id, req));
        req.addEventListener("error", () => {
            console.log(req.status, req.statusText)
        })
        req.send();
    }
    console.log(audio)

    audioContext = new AudioContext();
}

function onSuccess(id, req) {
    return () => {
        console.log("AUDIO LOAD");
        var audioData = req.response;
        audioContext.decodeAudioData(audioData, onBuffer(id), (e) => {
            console.log("Error decoding audio: " + e.message)
        })
    }
}

function onBuffer(id) {
    return function (buffer) {
        console.log("AUDIOBUFFER LOAD")
        audio[id] = buffer;
        stillLoading--;
        console.log(stillLoading)
        if (stillLoading <= 0) {
            init();
        }
    }
}

function init() {
    const image = document.getElementById("spritesheet");

    c = document.getElementById("mainCanvas");
    c.width = width * scale;
    c.height = height * scale;

    console.log(c.width, c.height)

    ctx = c.getContext("2d");
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.scale(scale, scale)

    loadSprites();
    getHighscore();

    for (var i = 0; i < 50; i++) {
        stars[i] = { x: Math.random() * width, y: Math.random() * height, brightness: Math.random() * 256 };
    }

    document.body.addEventListener("keydown", handleKeydown);
    document.body.addEventListener("keyup", handleKeyUp)
    document.addEventListener("visibilitychange", handleVisChange, false);

    loop(performance.now());
}

var insideCave = false; //Becomes true once cave pieces start spawning
var obstaclePoints = [];
var bullets = [];
var stars = [];
var enemies = [];

var fx = [];

var livesLeft = 3;
var movingLifePosition = { started: false, x: undefined, y: undefined }
var player = {
    y: height / 2,
    yv: 0,
    xv: 0.1,
    x: Math.floor(width / 6),
    blink: false,
    show: true,
    poweredUp: false,
	invinceTimer: 0
}
var paused = false;

var keysDown = {
    "w": false,
    "ArrowUp": false,
    "s": false,
    "ArrowDown": false,
    "d": false,
    "ArrowRight": false,
    " ": false,
};
let score = 0;
let framesPlayed = 0;
let wallDelay = 0;

let prevTime;

let fxframetimer = 0;
let scoretimer = 0;
let spawntimer = 0;
let poweruptimer = 60 * 10;
let superchargetime = 0;
var gameOver = false;

var prevWallY = height / 2;
var wallDirection = 0;

var wallBonks = 0

var powerup = { x: 0, y: 0, frame: 0, show: true };
var cps = 0
var cpst = 0
var cpsa = 00
function loop(now) {
    if (gameOver) {
        audioContext.close();
        requestAnimationFrame(renderGameOver.bind(this)); //And break the cycle of requestAnimationFrame()!
        return;
    } else {
        requestAnimationFrame(loop.bind(this));
    }
    if (paused) {
        return;
    }

    //DELTATIME CALCULTION
    if (prevTime === undefined) {
        prevTime = now - 16.66; //On the first frame, pretend that the previous frame happened 1/60th of a second ago (16.666 ms ago)
    }
    const dt = (now - prevTime) / 16.66; //Time since last frame draw, in frames. Should be exactly 1 when running at 60fps
    prevTime = now;
    framesPlayed += dt;
    fxframetimer += dt;
    scoretimer += dt
    spawntimer += dt;


    //Update explosion FXs
    if (fxframetimer > 4) {
        fxframetimer = 0;
        for (var i = 0; i < fx.length; i++) {

            fx[i].frame += 1;

            if (fx[i].spark === true) {
                //Safe to use `=` here since `frame` has to be an integer
                if (fx[i].frame == sprites.sparks.length - 1) {
                    fx.splice(i, 1);
                    continue;
                }
            } else if (fx[i].frame == sprites.explosion.length - 1) {
                fx.splice(i, 1);
            }
        }

        if (player.blink) {
            player.show = !player.show;
        }

        powerup.frame += 0.5;
        if (powerup.frame >= 3.5) {
            powerup.frame = 0;
        }
    }

    //Increase score every second
    if (scoretimer >= 60) {
        score += 10
        if (score > highscore) {
            highscore = score;
            setHighscore();
        }
        scoretimer = 0;
    }


    //ANIMATE STARS
    for (var i = 0; i < stars.length; i++) {
        if (stars[i].x <= 0) {
            stars[i] = { x: width, y: Math.random() * height, brightness: Math.random() * 256 };
        } else {
            stars[i].x -= player.xv * dt;
        }
    }


    //MOVE CAVE WALLS
    for (var i = 0; i < obstaclePoints.length; i++) {
        obstaclePoints[i].x -= player.xv * dt
    }

    if (obstaclePoints.length >= 3 && obstaclePoints[2].x < 0) {
        obstaclePoints.shift(); //Remove first element only after second has left the screen also
        obstaclePoints.shift();
        if (insideCave) {
            makeCavePointPair();
        }
    }

    if (!insideCave && obstaclePoints.length <= 2) {
        obstaclePoints.pop();
    }

    if (insideCave) {

        //AM I STILL IN A CAVE
        if (framesPlayed > 1800) {
            insideCave = false;
            framesPlayed = 0;
        }

        //CREATE CAVE WALLS (IF NECCESARY)
        if (obstaclePoints.length == 0 || (obstaclePoints[0].x > 0 && obstaclePoints[obstaclePoints.length - 1].x < width)) {
            //Cave hasn't filled the screen yet, more cavePoints are neccesary
            makeCavePointPair();
        }


        //HAVE I ENTERED A CAVE
    } else if (framesPlayed >= 3000) {
        insideCave = true;
        framesPlayed = 0;
        prevWallY = Math.random() * height;
        wallDirection = Math.random() * 20 - 10;
    }


    //PLAYER MOVEMENT
    if (keysDown.w || keysDown.ArrowUp) {
        player.yv -= 0.7 * dt;
    }
    if (keysDown.s || keysDown.ArrowDown) {
        player.yv += 0.7 * dt;
    }

    if (((obstaclePoints[obstaclePoints.length - 1] && obstaclePoints[obstaclePoints.length - 1].x > player.x) || player.poweredUp) && player.xv < 3.2) {
        player.xv += 0.02 * dt;//Accelerate when in caves or when given powerup
    } else if (player.xv > 0.1) { //Otherwise, slow down
        player.xv *= 0.99 * dt;
    }

    //Vel Caps
    if (player.yv > 7) {
        player.yv = 7;
    } else if (player.yv < -7) {
        player.yv = -7; //DON'T PULL A MARIO 64 AND FORGET NEGATIVE SPEED CAPS!!!
    }


    player.y += player.yv * dt;
    player.yv *= 0.9 * dt;

    //Position Caps
    if (player.y < 0) {
        player.y = 0;
    } else if (player.y > height) {
        player.y = height
    }


    //BULLETS
    if (bullets.length > 0) {
        for (var i in bullets) {
            if (bullets[i].player) {
                bullets[i].x += bullets[i].dx * dt;
            } else {
                bullets[i].x += bullets[i].dx - player.xv * dt;
            }
            bullets[i].y += bullets[i].dy * dt;
            if (bullets[i].x > width ||
                bullets[i].y > height ||
                bullets[i].x < 0 ||
                bullets[i].y < 0) {
                bullets.splice(i, 1);
                continue;
            }

            //Alien Killing
            if (bullets[i].player) {
                for (var j = 0; j < enemies.length; j++) {
                    if (collide(bullets[i].x, bullets[i].y, "playerShot", enemies[j].x, enemies[j].y, enemies[j].type)) {
                        bullets.splice(i, 1);
                        enemies[j].hp--;
                        if (enemies[j].hp <= 0) {
                            makeAlienExplode(j)
                        } else {
                            addFx(true, enemies[j].x, enemies[j].y)
                        }
                        break;  //Stop processing enemies, the bullet is gone
                    }
                }
                if (insideCave) {
                    //Collide with cave walls
                    if (collideWithWall(bullets[i].x, bullets[i].y, "playerShot")) {
                        bullets.splice(i, 1)
                    }
                }
            }
        }
    }

    //ALIEN MOVEMENT
    for (var i = 0; i < enemies.length; i++) {
        switch (enemies[i].type) {
            case "thiccboi":
                enemies[i].x -= (0.125 + player.xv) * dt;
                break;
            case "bug":
                enemies[i].x -= (0.25 + player.xv) * dt;
                break;
            case "arrow":
                enemies[i].x -= (0.5 + player.xv) * dt;
                break;
        }

        if (enemies[i].x < -10) {
            enemies.splice(i, 1);//Remove enemies that are offscreen
            continue;
        }

        enemies[i].shootCountdown -= dt;
        if (enemies[i].shootCountdown <= 0) {
            if (enemies[i].type == "thiccboi") {
                alienShoot(true, enemies[i].x - 5, enemies[i].y);
                alienShoot(true, enemies[i].x + 5, enemies[i].y);
                alienShoot(true, enemies[i].x - 5, enemies[i].y + 8);
                alienShoot(true, enemies[i].x + 5, enemies[i].y + 8);
                enemies[i].shootCountdown = 400;
            } else if (enemies[i].type == "bug") {
                alienShoot(false, enemies[i].x, enemies[i].y);
                enemies[i].shootCountdown = 300;
            } else if (enemies[i].type == "arrow") {
                alienShoot(true, enemies[i].x, enemies[i].y);
                enemies[i].shootCountdown = 160;
            }
        }
    }



    //ALIEN SPAWNING
    if (obstaclePoints.length == 0) { //Wait until the entire cave is offscreen

        if (spawntimer >= 120) {
            //Every 120 frames (Aka every other second)
            var numToSpawn = Math.round(Math.random() * 2 + 2); //Spawn 2-4 aliens
            for (numToSpawn; numToSpawn > 0; numToSpawn--) {
                var y = Math.random() * height;
                var type = function (obj) {
                    var keys = Object.keys(obj);
                    return keys[keys.length * Math.random() << 0];
                }(aliens);
                var hp = aliens[type];

                if (!collideWithAliens(width + 20, y, type)) { //Don't spawn aliens on top of one another- Decreases difficulty and visual glitches slightly ;)
                    enemies.push({ x: width + 20, y: y, type: type, hp: hp, shootCountdown: Math.random() * 200 });
                }
            }
            spawntimer = 0;
        }
    }

    //PLAYER COLLISIONS AND INVINCIBILITY
    if (player.blink) {
        //If player is blinking, they're invincible
        if (player.invinceTimer > 0) {
            player.invinceTimer -= dt;
        } else {
            player.blink = false;
        }
    } else {
        //If INVINCINBLE:
        if (insideCave || player.poweredUp) {
            //Smash enemies on entering cave or when given powerup
            for (var i = 0; i < enemies.length; i++) {
                if (collide(player.x, player.y, "player", enemies[i].x, enemies[i].y, enemies[i].type)) {
                    makeAlienExplode(i);
                }
                //Bullets will deal with themselves; player is immune anyway
            }
            //Alien-player and alien-bullet-player collision
        } else if (collideWithAliens(player.x, player.y, "player") || collideWithAlienBullets(player.x, player.y)) {
            player.blink = true;
            player.invinceTimer = 180;
            livesLeft--;

            if (livesLeft == 0) {
                gameOver = true;
            }
        }
        if (player.poweredUp) {
            if (superchargetime > 0) {
                superchargetime -= dt;
            } else {
                player.poweredUp = false;
            }
        }
    }
    //Cave wall collision
    if (obstaclePoints.length > 0) {
        var ny = collideWithWall(player.x, player.y, "player");
        if (ny) {
            player.y = ny;

            addFx(true, player.x, player.y)

			if (!player.blink) {
				player.blink = true;
				player.invinceTimer = 20;
				livesLeft--;
			}

			if (livesLeft == 0) {
				gameOver = true;
			}
        } else if (wallBonks > 0) {
            wallBonks -= 2;
        }
    }


    if (powerup.show) {
        //alert("Powerup!")
        if (collide(powerup.x, powerup.y, "powerup", player.x, player.y, "player")) {
            //If powerup collected:
            powerup.show = false;
            //alert("Collected Powerup")
            if (livesLeft < 3) {
                livesLeft++;
            } else {
                superchargetime = 60 * 7;
                player.poweredUp = true;
            }
        }
        if (powerup.x < -5) {
            powerup.show = false;
        }
        powerup.x -= dt + player.xv;
    } else if (poweruptimer <= 0) {
        //alert("Generating Powerup!")
        var y = Math.random() * height;
        if (!insideCave) {
            poweruptimer = 60 * 30;
            powerup = { x: width + 5, y: y, show: true, frame: 0 };
        }
        //If it doesn't get created, it will try again next frame!
    } else {
        poweruptimer -= dt;
    }

    //Render Everything
    render();
}

function render() {
    //Clear everything
    ctx.clearRect(0, 0, width, height)

    //Render stars
    for (var i = 0; i < stars.length; i++) {
        ctx.fillStyle = `rgb(${stars[i].brightness}, ${stars[i].brightness}, ${stars[i].brightness})`
        ctx.fillRect(stars[i].x, stars[i].y, 1, 1);
    }



    //Render bullets
    for (var i = 0; i < bullets.length; i++) {
        if (bullets[i].player) {
            sprites.playerShot.draw(ctx, bullets[i].x, bullets[i].y, Math.PI / 2)
        } else {
            sprites.alienShot.draw(ctx, bullets[i].x, bullets[i].y)
        }
    }


    //Render walls
    if (obstaclePoints.length >= 2) {
        ctx.beginPath();
        ctx.fillStyle = `grey`;
        ctx.moveTo(obstaclePoints[0].x, obstaclePoints[0].y2)
        for (var i = 1; i < obstaclePoints.length; i++) {
            ctx.lineTo(obstaclePoints[i].x, obstaclePoints[i].y2);
        }
        i--;
        ctx.lineTo(obstaclePoints[i].x, height);
        ctx.lineTo(obstaclePoints[0].x, height);
        ctx.closePath();
        ctx.fill()

        ctx.beginPath();
        ctx.moveTo(obstaclePoints[0].x, obstaclePoints[0].y1)
        for (var i = 1; i < obstaclePoints.length; i++) {
            ctx.lineTo(obstaclePoints[i].x, obstaclePoints[i].y1);
        }
        i--;
        ctx.lineTo(obstaclePoints[i].x, 0);
        ctx.lineTo(obstaclePoints[0].x, 0);
        ctx.closePath();
        ctx.fill();
    }

    //Render aliens
    for (var i = 0; i < enemies.length; i++) {
        var alien = enemies[i];

        sprites[alien.type].draw(ctx, alien.x, alien.y, Math.PI / 2)
    }

    //Render player
    if (!player.blink || player.show) {
        sprites.player.draw(ctx, player.x, player.y, Math.PI / 2);
    }

    //Render sparks and explosions
    for (var i = 0; i < fx.length; i++) {
        if (fx[i].spark) {
            sprites.sparks.draw(ctx, fx[i].frame, fx[i].x, fx[i].y)
        } else {
            sprites.explosion.draw(ctx, fx[i].frame, fx[i].x, fx[i].y)
        }
    }

    //Render powerup
    if (powerup.show) {
        //alert(`Rendering Powerup at ${powerup.x}:${powerup.y}`)
        sprites.powerup.draw(ctx, powerup.frame, powerup.x, powerup.y)
    }

    //Render Lives left
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 4px sans-serif monospace" //Keep in mind it's being upscaled; it's not actually a 6px font

    ctx.fillText("LIVES:", 3, 7);

    for (var i = 0; i < livesLeft; i++) {
        sprites.life.draw(ctx, (ctx.measureText("LIVES:").width) + 7 + i * 8, 4);
    }

    //Render Score
    ctx.fillText("SCORE: " + score.toString(10).padStart(6, '0'), 80, 7);
    ctx.fillText("HISCORE: " + highscore.toString(10).padStart(6, '0'), 170, 7)
}

function playSound(sound, speed) {
    if (audioContext) {
        var source = audioContext.createBufferSource();;   // creates a sound source
        source.buffer = audio[sound];
        source.playbackRate.value = speed;
        //source.connect(audioContext.destination);          // connect the source to the context's destination (the speakers)
        var gainNode = audioContext.createGain();          // Create a gain node
        source.connect(gainNode);                     // Connect the source to the gain node
        gainNode.connect(audioContext.destination);        // Connect the gain node to the destination
        gainNode.gain.value = 1;                  // Set the volume
        source.start(0);
    }
}

function handleKeydown(e) {
    if (e.key == " " && !keysDown[" "]) {
        shootFront();
    }

    keysDown[e.key] = true;
    if (e.key == " " || e.key == "ArrowUp" || e.key == "ArrowDown" && e.target == document.body) {
        e.preventDefault(); //Prevent spacebar/arrows from scrolling things
    }

    if (audioContext && audioContext.state == "suspended") {
        audioContext.resume(); //Audiocontext has to be started from keypress
    }
}
function handleKeyUp(e) {
    keysDown[e.key] = false;
}

function getHighscore() {
    if ("localStorage" in window && localStorage.getItem("highscore")) {
        highscore = parseInt(localStorage.getItem("highscore"), 10);
    } else {
        const val = document.cookie
            .split("; ")
            .find(row => row.startsWith('highscore='))

        if (val) {
            highscore = val.split("=")[1];
        }
    }
}

function setHighscore() {
    if ("localStorage" in window) {
        localStorage.setItem("highscore", highscore.toString(10));
    } else {
        document.cookie = `highscore=${highscore.toString(10)}; expires=Tue, 19 Jan 2038 04:14:07 GMT; samesite=strict`
    }
}

function handleVisChange(e) {
    console.log(document.visibilityState)
    if (document.visibilityState === "hidden") {
        paused = true;
    } else {
        paused = false;
        prevTime = performance.now() - 16.66 //Reset prevTime
    }
}
function shootFront() {
    if (!player.blink) {
        bullets.push({ dx: 4, dy: 0, x: player.x + 9, y: player.y + player.yv * 2, player: true });
        playSound("pew", 1)
        cps++
    }
}

function alienShoot(straight, x, y) {
    playSound("pew", Math.random() * 0.1 + 1.3);
    if (straight) {
        bullets.push({ dx: -1, dy: 0, x: x, y: y, player: false });
    } else {
        bullets.push({ dx: Math.random() * 4 - 2, dy: Math.random() * 4 - 2, x: x, y: y, player: false });
        if (Math.round(bullets[bullets.length - 1].dx) == 0 && Math.round(bullets[bullets.length - 1].dy) == 0) {
            bullets.pop();
        }
    }
}

function collide(sax, say, sas, sbx, sby, sbs) { //Sprite A x, y, and sprite type

    //Build Sprite A Bounding Box

    if (sprites[sas][0] == "animated") {
        //alert("Animated")
        var ax1 = sax - sprites[sas][1][2] / 2;
        var ay1 = say - sprites[sas][1][3] / 2;
        var ax2 = sax + sprites[sas][1][2] / 2;
        var ay2 = say + sprites[sas][1][3] / 2
    } else {
        var ax1 = sax - sprites[sas][3] / 2;
        var ay1 = say - sprites[sas][3] / 2;
        var ax2 = sax + sprites[sas][2] / 2;
        var ay2 = say + sprites[sas][2] / 2;
    }

    //Build sprite B Bounding Box
    if (sprites[sbs][0] == "animated") {
        //alert("Animated")
        var bx1 = sbx - sprites[sbs][1][2] / 2;
        var by1 = sby - sprites[sbs][1][3] / 2;
        var bx2 = sbx + sprites[sbs][1][2] / 2;
        var by2 = sby + sprites[sbs][1][3] / 2;
    } else {
        var bx1 = sbx - sprites[sbs][2] / 2;
        var by1 = sby - sprites[sbs][3] / 2;
        var bx2 = sbx + sprites[sbs][2] / 2;
        var by2 = sby + sprites[sbs][3] / 2;
    }

    //AABB Collision
    if (ax1 > bx2) return false;
    if (ax2 < bx1) return false;
    if (ay1 > by2) return false;
    if (ay2 < by1) return false;
    return true;
}

function addFx(spark, x, y) {
    if (!spark) {
        //If it's not a spark, it's a boom, so play a sound
        playSound(Math.random() < 0.5 ? "explode1" : "explode2", 1);
    }

    fx.push({ spark: spark, x: x, y: y, frame: 0 })
}

function collideWithAliens(sx, sy, st) {
    for (var i = 0; i < enemies.length; i++) {
        if (collide(sx, sy, st, enemies[i].x, enemies[i].y, enemies[i].type)) {
            return true;
        }
    }
    return false;
}

function collideWithAlienBullets(x, y) {
    for (var i = 0; i < bullets.length; i++) {
        if (bullets[i].player) { continue; }
        if (collide(x, y, "player", bullets[i].x, bullets[i].y, "alienShot")) {
            return true;
        }
    }
}
function renderGameOver(now) {
    const dt = (now - prevTime) / 16.66; //Time since last frame draw, IN FRAMES. Should be exactly 1 when running at 60fps

    //Clear everything
    ctx.clearRect(0, 0, width, height);

    //Render stars
    for (var i = 0; i < stars.length; i++) {
        if (stars[i].x <= 0) {
            stars[i] = { x: width, y: Math.random() * height, brightness: Math.random() * 256 };
        } else {
            stars[i].x -= player.xv * dt;
        }
        ctx.fillStyle = `rgb(${stars[i].brightness}, ${stars[i].brightness}, ${stars[i].brightness})`;
        ctx.fillRect(stars[i].x, stars[i].y, 1, 1);
    }
    player.xv *= 0.991 / dt;
    if (player.xv > 0) {
        requestAnimationFrame(renderGameOver.bind(this))
    }

    ctx.fillStyle = "white"

    const scoreText = `SCORE: ${score.toString(10).padStart(6, '0')}`;
    const hiscoreText = `HISCORE: ${highscore.toString(10).padStart(6, '0')}`;

    ctx.fillText(scoreText, width / 3 - ctx.measureText(scoreText).width / 2, height / 2);
    ctx.fillText(hiscoreText, 2 * (width / 3) - ctx.measureText(scoreText).width / 2, height / 2);
}

function makeAlienExplode(j) {
    addFx(false, enemies[j].x, enemies[j].y);
    switch (enemies[j].type) {
        case "thiccboi":
            score += 800;
            //Big aliens get big explosions
            addFx(false, enemies[j].x - 10, enemies[j].y - 4);
            addFx(false, enemies[j].x + 4, enemies[j].y + 10);
            addFx(false, enemies[j].x + 8, enemies[j].y + 8);
            break;
        case "bug":
            score += 200;
            break;
        case "arrow":
            score += 150;
            break;
    }
    enemies.splice(j, 1)
}

function makeCavePointPair() {
    prevWallY += wallDirection;
    wallDirection += Math.random() * 30 - 15;

    var h = 55 + Math.random() * 35

    var y1 = prevWallY - h / 2
    var y2 = prevWallY + h / 2

    if (prevWallY > height - 20) {
        prevWallY = height - 20;
        wallDirection = 0; //Reset wall direction, so it can easily go in a different direction
    } else if (prevWallY < 20) {
        prevWallY = 20;
        wallDirection = 0;
    }

    obstaclePoints.push({ x: width + 20, y1: y1, y2: y2 });
    obstaclePoints.push({ x: width + 40, y1: y1, y2: y2 });
}

function collideWithWall(spx, spy, spr) {
    //Cave wall collision system. Has to work with slopes, which makes everything more complecated

    for (var i = 0; i < obstaclePoints.length - 1; i++) { //Length -1 because this works in pairs
        const x1 = obstaclePoints[i].x;
        const x2 = obstaclePoints[i + 1].x;
        if (spx < x1 || spx > x2) {
            continue;
        }
        const y1l = obstaclePoints[i].y2;
        const y2l = obstaclePoints[i + 1].y2;

        const lowerslope = (y1l - y2l) / (x1 - x2);
        const xdist = spx - x1; //x1 should always be smaller or equal to spx
        const lowerheight = y1l + lowerslope * xdist
        const minY = lowerheight - sprites[spr][3] / 2
        if (spy > minY) {
            return minY;
        }

        const y1h = obstaclePoints[i].y1;
        const y2h = obstaclePoints[i + 1].y1;

        const upperslope = (y1h - y2h) / (x1 - x2);
        const upperheight = y1h + upperslope * xdist
        const maxY = upperheight + sprites[spr][3] / 2
        if (spy < maxY) {
            return maxY;
        }
        return false; //There will only ever be one segment
    }

    return false;
}