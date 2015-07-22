Math.clamp = Math.clamp || function(number, min, max) {
    return Math.max(Math.min(number, max), min);
};

/**
 * @memberof L3D
 * @constructor
 * @param {THREE.Renderer} renderer the renderer to use
 * @param {THREE.Scene} scene the scene to render
 * @description Displays a small preview of a camera
 */
L3D.Previewer = function(renderer, scene) {
    /**
     * @type {element}
     * @description The document element to add on top of the renderer
     */
    this.domElement = document.createElement('canvas');

    /**
     * @type {CanvasRenderingContext2D}
     * @description The context of domElement
     */
    this.ctx = this.domElement.getContext('2d');

    /**
     * @type {THREE.Renderer}
     * @description The renderer to use
     */
    this.renderer = renderer;

    /**
     * @type {THREE.Scene}
     * @description The scene to render
     */
    this.scene = scene;

    /**
     * @type {Boolean}
     * @description true if the preview should be stuck at the bottom left of the container,
     * false if it should appear near the mouse
     */
    this.fixed = false;

    /**
     * @private
     * @type {Boolean}
     * @description true if the rendering as already been done
     */
    this.drawn = false;

    /**
     * @private
     * @type {Boolean}
     * @description true if the rendering was done before
     */
    this.drawnBefore = false;

    this.mouse = {x: null, y: null};
};

/**
 * Renders the preview
 * @param {Object} pref an object containing :
 * <ul>
 *  <li><code>go</code> : a boolean if the rendering should be done</li>
 *  <li><code>x</code> : the x coordinate of the mouse</li>
 *  <li><code>y</code> : the y coordinate of the mouse</li>
 *  <li><code>camera</code> : the camera to use for the preview</li>
 * </ul>
 * @param {Number} container_width width of the container
 * @param {Number} container_height height of the container
 */
L3D.Previewer.prototype.render = function(container_width, container_height) {
    var width, height, left, bottom;

    if (this.camera) {
        width  = Math.floor(container_width / 5);
        height = Math.floor(container_height / 5);
        if (!this.fixed) {
            left = Math.floor(this.mouse.x - width/2);
            bottom = Math.floor(this.renderer.domElement.height - this.mouse.y + height/5);

            // Translate box if too high
            if (bottom + height > this.renderer.domElement.height) {
                bottom -= 7 * height / 5;
            }

            // Translate box if too on the side
            left = Math.clamp(left, width / 5, this.renderer.domElement.width - 6 * width / 5);

        } else {
            left = 20;
            bottom = 20;
        }

        // Draw border
        var can_bottom = container_height - bottom - height ;
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.moveTo(left-1, can_bottom);
        this.ctx.lineTo(left-1, can_bottom + height);
        this.ctx.lineTo(left + width-1, can_bottom + height);
        this.ctx.lineTo(left + width-1, can_bottom);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.strokeStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.moveTo(left, can_bottom + 1);
        this.ctx.lineTo(left, can_bottom + height - 1);
        this.ctx.lineTo(left + width - 2 , can_bottom + height-1);
        this.ctx.lineTo(left + width - 2, can_bottom+1);
        this.ctx.closePath();
        this.ctx.stroke();

        // Do render in previsualization
        this.camera.look();
        this.renderer.setScissor(left, bottom, width, height);
        this.renderer.enableScissorTest(true);
        this.renderer.setViewport(left, bottom, width, height);
        this.renderer.render(this.scene, this.camera);

        this.update(true);

        if (this.prevCamera !== this.camera) {
            this.clearNeeded = true;
        }

        this.prevCamera = this.camera;
    } else {
        this.update(false);
    }

    if (this.drawnBefore && !this.drawn) {
        this.clearNeeded = true;
    }

};

/**
 * Clears the borders of the preview
 */
L3D.Previewer.prototype.clear = function() {
    if (this.clearNeeded) {
        console.log("Clear");
        this.domElement.width = this.domElement.width;
        this.clearNeeded = false;
    }
};

/**
 * Setter for the fixed preview
 * @param {Boolean} true if you want to fix the preview, false otherwise
 */
L3D.Previewer.prototype.fixedRecommendation = function(bool) {
    this.fixed = bool;
};

/**
 * @private
 * @description Update flags
 * @param {Boolean} arg if the update drew something
 */
L3D.Previewer.prototype.update = function(arg) {
    this.drawnBefore = this.drawn;
    this.drawn = arg;
};

/**
 * @description Changes the camera used for the preview
 * @param {THREE.Camera} camera the new camera for preview
 */
L3D.Previewer.prototype.setCamera = function(camera) {
    this.camera = camera;
};

/**
 * @description Sets the position of the preview (automatically moves the
 * preview if the mouse is in the border of the canvas)
 * @param {Number} x x coordinate of the mouse
 * @param {Number} y y coordinate of the mouse
 */
L3D.Previewer.prototype.setPosition = function(x, y) {

    if (!this.drawn) {
        this.mouse.x = x;
        this.mouse.y = y;
    }

};

/**
 * @description Resets the size of the canvas and clears it
 * @param width {Number} the new width
 * @param height {Number} the new height
 */
L3D.Previewer.prototype.setSize = function(width, height) {
    this.domElement.width = width;
    this.domElement.height = height;
};
