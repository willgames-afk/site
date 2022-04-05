export class Vector2D {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    get angle() {
        return Math.atan2(x,y);
    }
    set angle(a) {
        this.x = cos(a);
        this.y = sin(a);
    }
    get mag() {
        return Math.sqrt(x * x + y * y);
    }
    normalize() {
        const mag = this.mag;
        this.x /= mag;
        this.y /= mag;
    }
    add(v2) {
        if (v2.x && v2.y) {
            this.x += v2.x;
            this.y += v2.y;
        } else {
            this.x += v2;
            this.y += v2;
        }
    }
}

export class RigidBody {
    constructor(shape, pos, mass, rot,vel,avel) {
        this.shape = shape;  //Shape of RigidBody; 
        this.pos = pos;      //Position, as a vector
        this.rotation = rot; //Rotation, in Radians. Rotates around the Center of Mass
        this.velocity = vel; //Linear Velocity as a vector (Pixels per Second)
        this.aVel = avel;    //Angular Velocity, in Radians per Second
        this.mass = mass     //Mass, in (Arbitrary Mass Units)
    }
    applyForce(rigidBody2) {

    }
    processs(gravity) {
        this.velocity.add(gravity.add(( 1 / this.mass)));

    }
}

export class Geometry {
    constructor(points) {
        this.points = points; //Geometries are made of a list of points, each one connected to the previous.

        //Calculate Mass by summing up area of triangles making up polygon

        //Calculate the COMs of those triangles, and weigh them all up to find the COM of the entire polygon

        //Normalize points around COM (Center of Mass = (0,0), redefine all the other points based on that)
    }
    trianglulate() { //Ear-Removal Triangulation
        if (this.points.length == 3) { //If it's already a triangle, no need to triangulate!
            return [this.points];
        }
        var triangles = [];
        for (i=2; i<this.points.length;i++) {
            triangles.push([0,i-1,i]);
        }
    }
}