// Initialization

// class camera extends THREE.PerspectiveCamera
var OldFixedCamera = function(arg1, arg2, arg3, arg4, position, target) {
    THREE.PerspectiveCamera.apply(this, arguments);

    // Set Position
    if (position === undefined) {
        this.position = new THREE.Vector3(0,0,5);
    } else {
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }

    if (target === undefined)
        target = new THREE.Vector3(0,0,0);

    var direction = target.clone();
    direction.sub(this.position);
    direction.normalize();

    this.target = this.position.clone();
    this.target.add(Tools.mul(direction,10));
    // this.up = new THREE.Vector3(0,0,1);

    // Compute corners

    // Create the mesh to draw

    var geometry = new THREE.Geometry();

    var left = Tools.cross(direction, this.up);
    var other = Tools.cross(direction, left);
    left.normalize();
    other.normalize();
    left = Tools.mul(left, 1);
    other  = Tools.mul(other, 1);

    geometry.vertices.push(Tools.sum(Tools.sum(this.position, left), other),
                           Tools.diff(Tools.sum(this.position, other),left),
                           Tools.diff(Tools.diff(this.position, left),other),
                           Tools.sum(Tools.diff(this.position, other), left)
                          );

    geometry.faces.push(new THREE.Face3(0,1,2), // new THREE.Face3(0,2,1),
                        new THREE.Face3(0,2,3)  // new THREE.Face3(0,3,2)
                        );

    (function(self, direction, left, other) {
        var material = new THREE.LineBasicMaterial({ color: '0x000000'});
        var geometry = new THREE.Geometry();
        var direction = Tools.mul(direction, -2);
        var target = Tools.sum(self.position, direction);
        // geometry.vertices.push(self.position, target);
        geometry.vertices.push(
            Tools.sum(Tools.sum(self.position, left), other),
            Tools.diff(Tools.sum(self.position, other),left),
            Tools.diff(Tools.diff(self.position, left),other),
            Tools.sum(Tools.diff(self.position, other), left),
            Tools.sum(Tools.sum(self.position, left), other),
            Tools.sum(Tools.diff(self.position, other), left),

            Tools.sum(self.position, direction),
            Tools.sum(Tools.sum(self.position, left), other),

            Tools.sum(self.position, direction),
            Tools.diff(Tools.sum(self.position, other),left),

            Tools.sum(self.position, direction),
            Tools.diff(Tools.diff(self.position, left),other),

            Tools.sum(self.position, direction),
            Tools.sum(Tools.diff(self.position, other), left)
        );

        self.line = new THREE.Line(geometry, material);
    })(this, direction, left, other);


    var material = new THREE.MeshBasicMaterial({
        color : 0xff0000,
        transparent : true,
        opacity : 1,
        side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.raycastable = true;
}
OldFixedCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
OldFixedCamera.prototype.constructor = OldFixedCamera;

// Update function
OldFixedCamera.prototype.update = function(position) {
    // Compute distance between center of camera and position
    dist = Tools.norm2(Tools.diff(position.position, this.position));

    var low_bound = 1;
    var high_bound = 5;
    var new_value;
    var max_value = 0.5;

    if (dist < low_bound)
        new_value = 0;
    else if (dist > high_bound)
        new_value = max_value;
    else
        new_value = max_value * (dist - low_bound)/(high_bound - low_bound);

    this.mesh.material.transparent = new_value < 0.9;
    this.mesh.material.opacity = new_value;

    if (new_value < 0.1)
        this.mesh.material.transparent = this.mesh.visible = false;
}

// Look function
OldFixedCamera.prototype.look = function() {
    this.lookAt(this.target);
}

OldFixedCamera.prototype.addToScene = function(scene) {
    scene.add(this);
    scene.add(this.mesh);
    scene.add(this.line);
}

OldFixedCamera.prototype.traverse = function(callback) {
    callback(this.mesh);
    callback(this.line);
}

OldFixedCamera.prototype.containsObject = function(object) {
    return object === this.mesh;
}

