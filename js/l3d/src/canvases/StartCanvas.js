/**
 * @memberof L3D
 * @constructor
 * @description Displays a translucid canvas over the renderer to enable interaction to lock pointer
 */
L3D.StartCanvas = function(camera) {

    /**
     * @type {elemnt}
     * @description The document element to add on top of the renderer
     */
    this.domElement = document.createElement('canvas');
    this.domElement.style.position = 'absolute';
    this.domElement.style.cssFloat = 'top-left';

    /**
     * @type {CanvasRenderingContext2D}
     * @description The context of the canvas
     */
    this.ctx = this.domElement.getContext('2d');

    /**
     * @type {Boolean}
     * @description true if the canvas is displayed
     */
    this.shown = false;

    camera.startCanvas = this;

};

/**
 * Shows the canvas with a string in the middle of it
 */
L3D.StartCanvas.prototype.render = function() {

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

/**
 * Hide canvas
 */
L3D.StartCanvas.prototype.clear = function() {

    if (this.shown) {

        // Clear canvas
        this.domElement.width = this.domElement.width;

        this.shown = false;

    }

};
