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
 * Shows the canvas with a string in the middle of it (not done if already shown)
 * @param {Boolean} force force the rendering
 */
L3D.StartCanvas.prototype.render = function(force) {

    if (!this.shown || force) {

        this.ctx.fillStyle = 'white';
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillRect(0,0,this.domElement.width, this.domElement.height);

        this.ctx.font = '30px Verdana';
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = 'black';
        this.ctx.fillText('Click here to lock the pointer !', containerSize.width()/3.25, containerSize.height()/2-10);


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

/**
 * Sets the size of the canvas
 * @param {Number} width new width of the canvas
 * @param {Number} height new height of the canvas
 */
L3D.StartCanvas.prototype.setSize = function(width, height) {

    this.domElement.width = width;
    this.domElement.height = height;

    // If the canvas was shown, redraw it
    if (this.shown)
        this.render(true);

};
