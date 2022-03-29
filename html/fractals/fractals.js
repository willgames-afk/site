canvas = document.getElementById('canvas')
ctx = canvas.getContext("2d")
canvas.width = window.innerWidth;
if (document.body.scrollHeight > window.innerHeight) {
    canvas.height = document.body.scrollHeight;
} else {
    canvas.height = window.innerHeight;
};
class fractalThing {
    constructer() {
        console.log('fractalThing created sucessfully')
    }
    draw(md,sx,sy,l,a,d) {
        ctx.beginPath();
        ctx.save();
    
        ctx.translate(sx, sy);
        ctx.rotate(a * Math.PI/180);
        ctx.moveTo(0, 0);
      	ctx.lineTo(0, -l);
        ctx.stroke();
    
        if(d>md) {
            ctx.restore();
            return;
        }

        this.recursionPattern(md,sx,sy,l,a,d);
        ctx.restore();
    }
    recursionPattern(md,sx,sy,l,a,d){
        this.draw(md, 0,-l,l*0.8,-15,d+1)
        this.draw(md, 0,-l,l*0.8,15,d+1)
    }
}

