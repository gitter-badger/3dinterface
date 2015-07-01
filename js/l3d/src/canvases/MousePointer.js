L3D.MousePointer = function(camera) {

    this.domElement = document.createElement('canvas');
    this.domElement.style.position = 'absolute';
    this.domElement.style.cssFloat = 'top-left';
    this.ctx = this.domElement.getContext('2d');
    this.size = 10;
    this.drawn = false;
    camera.mousePointer = this;
    this.style = L3D.MousePointer.NONE;
};

L3D.MousePointer.NONE = 0;
L3D.MousePointer.BLACK = 1;
L3D.MousePointer.RED = 2;

L3D.MousePointer.toColor = function(style) {

    switch (style) {

        case L3D.MousePointer.NONE:
            return null;
        case L3D.MousePointer.BLACK:
            return '#000000';
        case L3D.MousePointer.RED:
            return '#ff0000';

    }

};

L3D.MousePointer.prototype.render = function(style) {

    if (this.style !== style) {

        if (style === L3D.MousePointer.NONE) {

            // Clear canvas
            this.domElement.width = this.domElement.width;
            this.style = L3D.MousePointer.NONE;

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
            this.ctx.strokeStyle = L3D.MousePointer.toColor(style);
            this.ctx.stroke();

            this.style = style;

        }

    }

};

L3D.MousePointer.prototype.clear = function() {

    this.render(L3D.MousePointer.NONE);

};
