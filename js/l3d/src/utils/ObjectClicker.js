L3D.ObjectClicker = (function() {

function pointerCheck(camera) {
    return (camera instanceof L3D.PointerCamera && camera.pointerLocked);
}

/**
 * Class to allow easy object clicking
 * @constructor
 * @memberof L3D
 * @param renderer {THREE.Renderer} the renderer
 * @param camera {THREE.Camera} the camera to use
 * @param objects {Object[]} the objects on which the collision is possible
 * @param onHover {function} callback called when the mouse hovers an object
 * @param onClick {function} callback called when the user clicks an object
 * @param [domElement=document] {Element} element to which ObjectClicker listens to
 */
var ObjectClicker = function(renderer, camera, objects, onHover, onClick, domElement) {

    /**
     * Renderer used
     * @type {THREE.Renderer}
     */
    this.renderer = renderer;

    /**
     * Objects on which the collision is possible
     * @type {Object[]}
     */
    this.objects = objects;

    /**
     * Function called when the mouse hovers an object
     * @type {function}
     */
    this.onHover = onHover;

    /**
     * Function called when the user clicks on an object
     * @type {function}
     */
    this.onClick = onClick;

    /**
     * Camera used for ray casting
     * @type {THREE.Camera}
     */
    this.camera = camera;

    /**
     * Position of the mouse
     * @type {Object}
     */
    this.mouse = {x: null, y: null};

    /**
     * Element on which we will listen
     * @type {Element}
     */
    this.domElement = domElement || document;

    /**
     * Element currently hovered
     * @type {Object}
     */
    this.hoveredElement = null;

    /**
     * Raycaster used for finding the objects
     * @private
     * @type {THREE.Raycaster}
     */
    this.raycaster = new THREE.Raycaster();

    /**
     * Currently pointed object
     * @type {Object}
     */
    this.currentPointedObject = null;

    /**
     * Previously pointed object
     * @type {Object}
     */
    this.previousPointedObject = null;

    // Add event listeners
    var self = this;
    this.domElement.addEventListener('mousemove', function(event) { self.update(event); });

    if (navigator.userAgent.indexOf("Firefox") > 0) {
        // If firefox
        this.domElement.addEventListener('mousedown', function(event) {self.click(event); });
    } else {
        // If chrome
        this.domElement.addEventListener('click', function(event) { self.click(event); });
        this.domElement.addEventListener('contextmenu', function(event) { event.button = 2; self.click(event); });
    }

};

/**
 * Returns the object pointed by the mouse
 */
ObjectClicker.prototype.getPointedObject = function() {

    // Compute x and y for unprojection
    var x = ( this.mouse.x / this.renderer.domElement.width ) * 2 - 1;
    var y = - (this.mouse.y / this.renderer.domElement.height) * 2 + 1;

    if (pointerCheck(this.camera)) {

        x = 0;
        y = 0;

    }

    var vector = new THREE.Vector3(x,y,0.5);
    vector.unproject(this.camera);

    // Set raycaster
    this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());

    // Compute intersections
    var intersects = this.raycaster.intersectObjects(this.objects, false);

    // Avoid non-raycastable objects
    for (var i = 0; i < intersects.length && !intersects[i].object.raycastable; i++){}

    // Objects are sorted by distance in intersects, the best is the first
    return intersects[i];

};

/**
 * Updates the position of the mouse and the hovered object and calls onHover
 * @param event {Event} the event received by 'mousemove'
 */
ObjectClicker.prototype.update = function(event) {

    // Set mouse position
    if (event !== undefined) {

        this.mouse.x = event.offsetX || event.layerX;
        this.mouse.y = event.offsetY || event.layerY;

    }

    // Update current pointed object
    this.previousPointedObject = this.currentPointedObject;
    this.currentPointedObject = this.getPointedObject();

    // If those two objects are different, call onHover
    if (this.previousPointedObject !== this.currentPointedObject) {
        var p = pointerCheck(this.camera);
        this.onHover(
            this.currentPointedObject,
            p ? this.renderer.domElement.width  / 2 : this.mouse.x,
            p ? this.renderer.domElement.height / 2 : this.mouse.y
        );

    }

};

/**
 * Calls onClick on the current pointed element
 */
ObjectClicker.prototype.click = function(event) {

    this.onClick(this.currentPointedObject, this.mouse.x, this.mouse.y, event);

};

return ObjectClicker;

})();
