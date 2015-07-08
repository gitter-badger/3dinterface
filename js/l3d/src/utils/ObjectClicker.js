L3D.ObjectClicker = (function() {

function pointerCheck(camera) {
    return (camera instanceof L3D.PointerCamera && camera.pointerLocked);
}

var ObjectClicker = function(renderer, camera, objects, onHover, onClick, domElement) {

    this.renderer = renderer;
    this.objects = objects;
    this.onHover = onHover;
    this.onClick = onClick;
    this.camera = camera;

    this.mouse = {x: null, y: null};

    this.domElement = domElement || document;

    this.hoveredElement = null;

    this.raycaster = new THREE.Raycaster();

    this.currentPointedObject = null;
    this.previousPointedObject = null;

    // Add event listeners
    var self = this;
    this.domElement.addEventListener('mousemove', function(event) { self.update(event); });
    this.domElement.addEventListener('click', function(event) { self.click(event); });

};

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
    for (var i = 0; i < intersects.length && !intersects[i].object.raycastable; i++){};

    // Objects are sorted by distance in intersects, the best is the first
    return intersects[i] !== undefined ? intersects[i].object : undefined;

};

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

ObjectClicker.prototype.click = function() {

    this.onClick(this.currentPointedObject, this.mouse.x, this.mouse.y);

}

return ObjectClicker;

})();
