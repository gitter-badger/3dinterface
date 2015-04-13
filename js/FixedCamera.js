// Initialization

// class camera extends THREE.PerspectiveCamera
var FixedCamera = function(arg1, arg2, arg3, arg4, position, target) {
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
    this.up = new THREE.Vector3(0,0,1);

    // Compute corners

    // Create the mesh to draw

    var geometry = new THREE.Geometry();

    var left = Tools.cross(direction, this.up);
    var other = Tools.cross(direction, left);
    left.normalize();
    other.normalize();
    left = Tools.mul(left, 100);
    other  = Tools.mul(other, 100);

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
        var direction = Tools.mul(direction, -200);
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
        opacity : 0.5,
        side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
}
FixedCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
FixedCamera.prototype.constructor = FixedCamera;

// Update function
FixedCamera.prototype.update = function() {

}

// Look function
FixedCamera.prototype.look = function() {
    this.lookAt(this.target);
}

FixedCamera.prototype.addToScene = function(scene) {
    scene.add(this);
    scene.add(this.mesh);
    scene.add(this.line);
}

FixedCamera.prototype.traverse = function(callback) {
    callback(this.mesh);
    callback(this.line);
}
