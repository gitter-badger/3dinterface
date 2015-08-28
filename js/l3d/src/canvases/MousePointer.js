/**
 * Contains a canvas to place over the renderer for FPS-style pointer
 * It's based on a javascript 2d-canvas : you'll need to render it manually.
 *
 * @example
 * var container = documeng.getElementById('container');
 * var renderer = new THREE.WebGLRenderer();
 * renderer.setSize(width, height);
 *
 * var pointerCamera = new L3D.PointerCamera(50, width/height, near, fat, renderer, container);
 * var mousePointer = new L3D.MousePointer(pointerCamera);
 * mousePointer.domElement.width = width;
 * mousePointer.domElement.height = height;
 *
 * container.appendChild(mousePointer.domElement);
 * container.appendChild(renderer.domElement);
 *
 * mousePointer.render(L3D.MousePointer.BLACK);
 * @memberof L3D
 * @constructor
 */
L3D.MousePointer = function(camera) {

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
     * @type {Number}
     * @description The size of the gun sight
     */
    this.size = 10;

    camera.mousePointer = this;

    /**
     * @type {Number}
     * @description a L3D.MousePointer style. The current style of the mouse pointer
     */
    this.style = L3D.MousePointer.NONE;

};

/**
 * @memberof L3D.MousePointer
 * @type {Number}
 * @static
 * @description Empty style : the canvas is fully transparent
 */
L3D.MousePointer.NONE = 0;

/**
 * @memberof L3D.MousePointer
 * @type {Number}
 * @static
 * @description Black style : the canvas contains only a white cross in the middle of the screen
 */
L3D.MousePointer.BLACK = 1;

/**
 * @memberof L3D.MousePointer
 * @type {Number}
 * @static
 * @description Red style : the canvas contains only a white and red cross in the midlle
 * (used for hovering stuff)
 */
L3D.MousePointer.RED = 2;

/**
 * @memberof L3D.MousePointer
 * @static
 * @description Converts a style to a color
 * @param {Number} style a L3D.MousePointer style (NONE, BLACK, or RED)
 * @returns {string} null if input is NONE, a hex color string else
 */
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

/**
 * Re-renders the canvas
 * For performance reasons, the rendering is done only if the style changed.
 * @param {Number} style the L3D.MousePointer style you want to render
 * @param {Boolean} [force=false] force the re-rendering (even if the style did not change)
 *
 */
L3D.MousePointer.prototype.render = function(style, force) {

    if (style === undefined) {

        style = L3D.MousePointer.NONE;

    }

    if (force === undefined) {

        force = false;

    }

    if (this.style !== style || force) {

        if (style === L3D.MousePointer.NONE) {

            // Clear canvas
            this.domElement.width = this.domElement.width;
            this.style = L3D.MousePointer.NONE;

        } else {

            this.domElement.width = this.domElement.width;

            var i = containerSize.width() / 2;
            var imin = i - this.size;
            var imax = i + this.size;

            var j = containerSize.height() / 2;
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

/**
 * Clears the canvas
 * @param {Boolean} force force the clearing (even if the style did not change)
 */
L3D.MousePointer.prototype.clear = function(force) {

    if (force === undefined) {

        force = false;

    }

    this.render(L3D.MousePointer.NONE, force);

};

/**
 * Sets the size of the canvas
 * @param {Number} width the new width of the canvas
 * @param {Number} height the new height of the canvas
 */

L3D.MousePointer.prototype.setSize = function(width, height) {

    this.domElement.width = width;
    this.domElement.height = height;

    this.render(this.style, true);

};
