var MousePointer = function(camera) {
    this.domElement = document.createElement('canvas');
    this.domElement.style.position = 'absolute';
    this.domElement.style.cssFloat = 'top-left';
    this.ctx = this.domElement.getContext('2d');
    this.size = 10;
    this.drawn = false;
    camera.mousePointer = this;
}

MousePointer.prototype.render = function() {

    if (!this.drawn) {
        this.drawn = true;

        var i = container_size.width() / 2;
        var imin = i - this.size;
        var imax = i + this.size;

        var j = container_size.height() / 2;
        var jmin = j - this.size;
        var jmax = j + this.size;

        this.ctx.stokeStyle = "black";
        this.ctx.beginPath();
        this.ctx.moveTo(imin, j);
        this.ctx.lineTo(imax, j);
        this.ctx.moveTo(i, jmin);
        this.ctx.lineTo(i, jmax);

        this.ctx.closePath();
        this.ctx.stroke();
    }

}

MousePointer.prototype.clear = function() {

    if (this.drawn) {
        this.drawn = false;
        this.domElement.width = this.domElement.width;
    }

}
