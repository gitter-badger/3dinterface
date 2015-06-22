var MousePointer = function(camera) {

    this.domElement = document.createElement('canvas');
    this.domElement.style.position = 'absolute';
    this.domElement.style.cssFloat = 'top-left';
    this.ctx = this.domElement.getContext('2d');
    this.size = 10;
    this.drawn = false;
    camera.mousePointer = this;
    this.style = MousePointer.NONE;
}

MousePointer.NONE = 0;
MousePointer.BLACK = 1;
MousePointer.RED = 2;

MousePointer.toColor = function(style) {

    switch (style) {

        case MousePointer.NONE:
            return null;
        case MousePointer.BLACK:
            return '#000000';
        case MousePointer.RED:
            return '#ff0000';

    }

}

MousePointer.prototype.render = function(style) {

    if (this.style !== style) {

        if (style === MousePointer.NONE) {

            // Clear canvas
            this.domElement.width = this.domElement.width;
            this.style = MousePointer.NONE;

        } else {

            this.domElement.width = this.domElement.width;

            var i = container_size.width() / 2;
            var imin = i - this.size;
            var imax = i + this.size;

            var j = container_size.height() / 2;
            var jmin = j - this.size;
            var jmax = j + this.size;

            this.ctx.beginPath();
            this.ctx.moveTo(imin, j);
            this.ctx.lineTo(imax, j);
            this.ctx.moveTo(i, jmin);
            this.ctx.lineTo(i, jmax);
            this.ctx.closePath();


            this.ctx.lineWidth = 5;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.stroke();

            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = MousePointer.toColor(style);
            this.ctx.stroke();

            this.style = style;

        }

    }

}

MousePointer.prototype.clear = function() {

    this.render(MousePointer.NONE);

}
