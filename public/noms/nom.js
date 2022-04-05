/*TO DO-

-Implement real physics
-Automake Noms based on area of webpage and add/remove them on resize
-Perfect resizing.

*/
class Things {
    constructor(numberofnoms) {
        this.noms = [];
        this.lines = [];
        this.configs = {
            connectLinesByHover: false,
            lineValuesShown: false,
            dotValuesShown: false,
            physicsQuality: 1,
            /*
            0: No phisics at all, noms can pass straight through each other
    
            1: lowest quality physics; each nom will only check for collision against the nearest nom to it
            and noms at high speed may glith through other noms entirely.
    
            2 (recommended): noms use an AABB to check for collision against all other noms, high speed noms 
            can still glitch through other noms
    
            3 highest quality physics; same as 2 except High Speed noms can no longer glitch through other 
            noms
            */
            wallCollision: true,
            gravityY: 0,
            gravityX: 0,
            maxVel: 19,
            max: 100,
        };
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'dotcanvas'
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener('resize',this.resize.bind(this));
        this.resize(); //Takes care of making enough noms to fill the screen
    }
    make(
        x = this.randomXInCanvas(10),
        y = this.randomYInCanvas(10),
        color = this.randomColor(),
        xVel = Math.random() * 2 - 1,
        yVel = Math.random() * 2 - 1,
        mass = 10,
        radius = 10
    ) {
        if (typeof x == 'object' && !Array.isArray(x)) {
            //if it is an object and not an array
            y = x.y;
            color = x.color;
            xVel = x.xVel;
            yVel = x.yVel;
            x = x.x;
            mass = x.mass;
            radius = x.radius;
        }
        this.noms.push({
            x: x,
            y: y,
            xVel: xVel,
            yVel: yVel,
            color: color,
            mass: mass,
            radius: radius,
            colliding: false,
            rotation: Math.atan2(yVel, xVel),
            aabb: {
                x: x - radius,
                y: y - radius,
                width: 2 * radius,
                height: 2 * radius,

            }
        });
    }
    makeLine(p1, p2, value, color = 'rgb(0,0,0)') {
        this.lines.push({ p1: p1, p2: p2, value: value, color: color });
    }
    makeRect(x, y, width, height, mass, xVel = 0, yVel = 0, color) {
        if (typeof x == 'object' && !Array.isArray(x)) {
            //if it is an object and not an array
            y = x.y;
            color = x.color;
            xVel = x.xVel;
            yVel = x.yVel;
            x = x.x;
            width = x.width;
            height = x.height;
            mass = x.mass;
        }
        this.noms.push({
            x: x,
            y: y,
            xVel: xVel,
            yVel: yVel,
            color: color,
            mass: mass,
            width: width,
            height: height,
        });
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < this.lines.length; i++) {
            line = this.lines[i];
            lineCoords = { x1: this.noms[line.p1].x, y1: this.noms[line.p1].y, x2: this.noms[line.p2].x, y2: this.noms[line.p2].y };
            this.ctx.fillStyle = line.color;
            this.ctx.beginPath();
            this.ctx.moveTo(lineCoords.x1, lineCoords.y1);
            this.ctx.lineTo(lineCoords.x2, lineCoords.y2);
            this.ctx.stroke();
        };
        for (var i = 0; i < this.noms.length; i++) {
            var nom = this.noms[i];
            this.ctx.beginPath();
            this.ctx.arc(nom.x, nom.y, 10, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = nom.color;
            this.ctx.fill();
        };
    }
    process() {
        if (this.configs.physicsQuality > 0) {
            this.processPhysics();
        };
    }
    processPhysics() {
        var AABBCollisionBuffer = [];
        var config = this.configs;
        var i, k;
        for (var i = 0; i < this.noms.length; i++) {
            var nom = this.noms[i];
            //move noms & apply gravity
            nom.x += nom.xVel;
            nom.y += nom.yVel;
            nom.yVel += config.gravityY;
            nom.xVel += config.gravityX;

            //make sure velocities don't exceed the max
            if (nom.xVel > config.maxVel) {
                nom.xVel = config.maxVel;
            };
            if (nom.yVel > config.maxVel) {
                nom.yVel = config.maxVel;
            };

            //check wall collision (if we need to)
            if (config.wallCollision) {
                if (nom.x < nom.radius) {
                    nom.xVel = 0 - nom.xVel;
                    nom.x = nom.radius;
                } else if (nom.x > this.canvas.width - nom.radius) {
                    nom.xVel = 0 - nom.xVel;
                    nom.x = this.canvas.width - nom.radius;
                };
                if (nom.y < nom.radius) {
                    nom.yVel = 0 - nom.yVel;
                    nom.y = nom.radius;
                } else if (nom.y > this.canvas.height - 10 && !nom.wallcollide) {
                    nom.yVel = 0 - nom.yVel;
                    nom.y = this.canvas.height - nom.radius;
                }
            }

            //check nom-nom collision (if there are at least two noms)
            if (this.noms.length > 1) {
                if (this.configs.physicsQuality == 1) {

                    //only checks against the closest nom
                    var closest = this.findClosest(i);
                    if (closest.distance < nom.radius + this.noms[closest.index].radius) {
                        //if we havent already processed the collision
                        if (!nom.colliding) {
                            nom.colliding = true;
                            this.noms[closest.index].colliding = true;
                            this.processNomCollision(i, closest.index);
                        }
                    } else {
                        nom.colliding = false;
                    }
                } else if (this.configs.physicsQuality >= 2) {
                    //for physicsQuality 2 we have to do an AABB check to save on system resources
                    //if (i < things.noms.length - 1) { //don't have to check the last AABB because it will have already been checked against all other AABBs
                    for (var k = i; k < this.noms.length; k++) {
                        //check AABB collision for nom #i and nom #k
                        var aabb1 = nom.aabb;
                        var aabb2 = this.noms[k].aabb;
                        if (aabb1.x < aabb2.x + aabb2.width &&
                            aabb1.x + aabb1.width > aabb2.x &&
                            aabb1.y < aabb2.y + aabb2.height &&
                            aabb1.y + aabb1.height > aabb2.y) {
                            //We have an AABB collision! Stick it in the buffer to deal with later.
                            AABBCollisionBuffer.push({ nomIndex1: k, nomIndex2: i });
                        }
                    }
                    //}
                }
            }
        }
        //now we deal with any AABB collisions we found 6 brackets ago
        if (!(AABBCollisionBuffer.length == 0)) {
            console.log(AABBCollisionBuffer.length)
            for (var i = 0; i < AABBCollisionBuffer.length; i++) {
                var nomIndex1 = AABBCollisionBuffer[i].nomIndex1;
                var nomIndex2 = AABBCollisionBuffer[i].nomIndex2;
                var nom1 = this.noms[nomIndex1];
                var nom2 = this.noms[nomIndex2];
                if (this.findDistance(nomIndex1, nomIndex2) < nom1.radius + nom2.radius) {
                    nom1.colliding = true;
                    nom2.colliding = true;
                    this.processNomCollision(nomIndex1, nomIndex2);
                }
            }
            //We've processed through all the AABB collisions, so we can clear the AABB buffer
            AABBCollisionBuffer = [];
            console.log(AABBCollisionBuffer.length);
        }
    }
    processNomCollision(nomIndex1, nomIndex2) {
        //locating noms
        var nom = this.noms[nomIndex1];
        var nom2 = this.noms[nomIndex2];

        //calculating new velocities
        var newxVel1 = (nom.xVel * (nom.mass - nom2.mass) + (2 * nom2.mass * nom2.xVel)) / (nom.mass + nom2.mass);
        var newyVel1 = (nom.yVel * (nom.mass - nom2.mass) + (2 * nom2.mass * nom2.yVel)) / (nom.mass + nom2.mass);
        var newxVel2 = (nom2.xVel * (nom2.mass - nom.mass) + (2 * nom.mass * nom.xVel)) / (nom.mass + nom2.mass);
        var newyVel2 = (nom2.yVel * (nom2.mass - nom.mass) + (2 * nom.mass * nom.yVel)) / (nom.mass + nom2.mass);

        //applying new velocities
        nom.xVel = newxVel1;
        nom.yVel = newyVel1;
        nom2.xVel = newxVel2;
        nom2.yVel = newyVel2;
    }
    findClosest(nomIndex) {
        //finds distances to all points, then sorts them and returns 
        //the index of the closest dot, as well as the distance to that dot.
        var distances = this.findDistances(nomIndex);
        distances.sort((a, b) => a.distance - b.distance);
        return distances[0];
    }
    findFurthest(nomIndex) {
        //same as findClosest but sorts the opposite way
        var distances = this.findDistances(nomIndex);
        distances.sort((a, b) => b.distance - a.distance);
        return distances[0];
    }
    findDistances(nomIndex) {
        //calculates the distances from the a point to all other points
        var noms = this.noms; //convinience
        var distances = [];
        for (var i2 = 0; i2 < noms.length; i2++) {
            if (i2 == nomIndex) {
                //Don't count yourself!
                continue;
            }
            //Calculate distance and store it
            distances.push({ index: i2, distance: this.findDistance(nomIndex, i2) });

        }
        return distances;
    }
    findDistance(nomIndex1, nomIndex2) {
        //calculates the distance between 2 noms
        return Math.hypot(Math.abs(this.noms[nomIndex1].x - this.noms[nomIndex2].x), Math.abs(this.noms[nomIndex1].y - this.noms[nomIndex2].y));
    }
    rgbify(r, g, b) {
        //returns an RGB string from 3 rgb values.
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
    randomColor() {
        //returns a random color in the form of an RGB string
        return this.rgbify(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
    }
    main() {
        //mainloop
        this.process();
        this.render();
        requestAnimationFrame(this.main.bind(this));
    }
    randomXInCanvas(pad) {
        //returns a random x coordanate inside canvas with padding.
        return (Math.random() * (this.canvas.width - 2 * pad)) + pad;
    }
    randomYInCanvas(pad) {
        //same as randomXInCanvas but for Y coordanate
        return (Math.random() * (this.canvas.height - 2 * pad)) + pad;
    }
    resize(e) {
        //resize handler
        this.canvas.width = window.innerWidth;
        if (document.body.scrollWidth > window.innerWidth) {
            var width = document.body.scrollWidth;
            if (document.body.style.marginleft) {
                width += document.body.style.marginLeft;
            }
            if (document.body.style.marginRight) {
                width += document.body.style.marginRight;
            }
            this.canvas.width = width;
        }

		//console.log("Resize; ", this.canvas.height, window.innerHeight)
        this.canvas.height = window.innerHeight;
        if (document.body.scrollHeight > window.innerHeight) {
            this.canvas.height = document.body.scrollHeight;
        }

        var nomsPerpx2 = 0.00005;
        //alert(nomsPerpx2 * this.canvas.width * this.canvas.height);
       
        while (this.noms.length < nomsPerpx2 * this.canvas.width * this.canvas.height) {
            this.make();
        }
        while (this.noms.length > nomsPerpx2 * this.canvas.width * this.canvas.height) {
            this.noms.splice(Math.round(Math.random()*this.noms.length-1),1);
        }
    }
}
window.addEventListener('load', function (e) {
    window.noms = new Things();
    noms.main();
});