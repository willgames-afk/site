fractal = new fractalThing()
fractal.recursionPattern = function(md,sx,sy,l,a,d){
    this.draw(md, 0,-l,l*1/Math.SQRT2,-90,d+1)
    this.draw(md, 0,-l,l*1/Math.SQRT2,90,d+1)
}
fractal.draw(10,canvas.width/2,canvas.height/2,100,90,0)
fractal.draw(10,canvas.width/2, canvas.height/2,100,-90,0)