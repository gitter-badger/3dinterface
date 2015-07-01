var StartCanvas = function(camera) {

    this.domElement = document.createElement('canvas');
    this.domElement.style.position = 'absolute';
    this.domElement.style.cssFloat = 'top-left';
    this.ctx = this.domElement.getContext('2d');
    this.shown = false;

    camera.startCanvas = this;

};

StartCanvas.prototype.render = function() {

    if (!this.shown) {

        this.ctx.fillStyle = 'white';
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillRect(0,0,this.domElement.width, this.domElement.height);

        this.ctx.font = '30px Verdana';
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = 'black';
        this.ctx.fillText('Click here to lock the pointer !', container_size.width()/3.25, container_size.height()/2-10);


        this.shown = true;

    }

};

StartCanvas.prototype.clear = function() {

    if (this.shown) {

        // Clear canvas
        this.domElement.width = this.domElement.width;

        this.shown = false;

    }

};
