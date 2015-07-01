// Initialization

// class camera extends THREE.PerspectiveCamera
L3D.ViewportRecommendation = function(arg1, arg2, arg3, arg4, position, target) {
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
    this.target.add(L3D.Tools.mul(direction,10));
    // this.up = new THREE.Vector3(0,0,1);

    // Compute corners

    // Create the mesh to draw

    var geometry = new THREE.Geometry();

    var left = L3D.Tools.cross(direction, this.up);
    var other = L3D.Tools.cross(direction, left);
    left.normalize();
    other.normalize();
    left = L3D.Tools.mul(left, 1);
    other  = L3D.Tools.mul(other, 1);

    geometry.vertices.push(L3D.Tools.sum(L3D.Tools.sum(this.position, left), other),
                           L3D.Tools.diff(L3D.Tools.sum(this.position, other),left),
                           L3D.Tools.diff(L3D.Tools.diff(this.position, left),other),
                           L3D.Tools.sum(L3D.Tools.diff(this.position, other), left)
                          );

    geometry.faces.push(new THREE.Face3(0,1,2), // new THREE.Face3(0,2,1),
                        new THREE.Face3(0,2,3)  // new THREE.Face3(0,3,2)
                        );

    (function(self, direction, left, other) {
        var material = new THREE.LineBasicMaterial({ color: '0x000000'});
        var geometry = new THREE.Geometry();
        var tmp_direction = L3D.Tools.mul(direction, -2);
        var target = L3D.Tools.sum(self.position, tmp_direction);
        // geometry.vertices.push(self.position, target);
        geometry.vertices.push(
            L3D.Tools.sum(L3D.Tools.sum(self.position, left), other),
            L3D.Tools.diff(L3D.Tools.sum(self.position, other),left),
            L3D.Tools.diff(L3D.Tools.diff(self.position, left),other),
            L3D.Tools.sum(L3D.Tools.diff(self.position, other), left),
            L3D.Tools.sum(L3D.Tools.sum(self.position, left), other),
            L3D.Tools.sum(L3D.Tools.diff(self.position, other), left),

            L3D.Tools.sum(self.position, tmp_direction),
            L3D.Tools.sum(L3D.Tools.sum(self.position, left), other),

            L3D.Tools.sum(self.position, tmp_direction),
            L3D.Tools.diff(L3D.Tools.sum(self.position, other),left),

            L3D.Tools.sum(self.position, tmp_direction),
            L3D.Tools.diff(L3D.Tools.diff(self.position, left),other),

            L3D.Tools.sum(self.position, tmp_direction),
            L3D.Tools.sum(L3D.Tools.diff(self.position, other), left)
        );

        self.line = new THREE.Line(geometry, material);
    })(this, direction, left, other);


    var material = new THREE.MeshBasicMaterial({
        color : 0x0000ff,
        transparent : true,
        opacity : 1,
        side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.raycastable = true;
};
L3D.ViewportRecommendation.prototype = Object.create(THREE.PerspectiveCamera.prototype);
L3D.ViewportRecommendation.prototype.constructor = L3D.ViewportRecommendation;

L3D.ViewportRecommendation.prototype.check = function() {
    this.mesh.material.color.setHex(0x663366);
};

// Update function
L3D.ViewportRecommendation.prototype.update = function(position) {
    // Compute distance between center of camera and position
    dist = L3D.Tools.norm2(L3D.Tools.diff(position.position, this.position));

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
};

// Look function
L3D.ViewportRecommendation.prototype.look = function() {
    this.lookAt(this.target);
};

L3D.ViewportRecommendation.prototype.addToScene = function(scene) {
    scene.add(this);
    scene.add(this.mesh);
    scene.add(this.line);
};

L3D.ViewportRecommendation.prototype.traverse = function(callback) {
    callback(this.mesh);
    callback(this.line);
};

L3D.ViewportRecommendation.prototype.containsObject = function(object) {
    return object === this.mesh;
};

L3D.ViewportRecommendation.prototype.setSize = function(size) {

    var direction = this.target.clone();
    direction.sub(this.position);
    direction.normalize();

    var left = L3D.Tools.cross(direction, this.up);
    var other = L3D.Tools.cross(direction, left);
    left.normalize();
    other.normalize();
    left = L3D.Tools.mul(left, size);
    other  = L3D.Tools.mul(other, size);

    this.mesh.geometry.vertices = [
        L3D.Tools.sum(L3D.Tools.sum(this.position, left), other),
        L3D.Tools.diff(L3D.Tools.sum(this.position, other),left),
        L3D.Tools.diff(L3D.Tools.diff(this.position, left),other),
        L3D.Tools.sum(L3D.Tools.diff(this.position, other), left)
    ];

    this.mesh.geometry.verticesNeedUpdate = true;

    (function(self, direction, left, other, size) {

        var tmp_direction = L3D.Tools.mul(direction, -2 * size);
        var target = L3D.Tools.sum(self.position, tmp_direction);

        var vertices = [
            L3D.Tools.sum(L3D.Tools.sum(self.position, left), other),
            L3D.Tools.diff(L3D.Tools.sum(self.position, other),left),
            L3D.Tools.diff(L3D.Tools.diff(self.position, left),other),
            L3D.Tools.sum(L3D.Tools.diff(self.position, other), left),
            L3D.Tools.sum(L3D.Tools.sum(self.position, left), other),
            L3D.Tools.sum(L3D.Tools.diff(self.position, other), left),

            L3D.Tools.sum(self.position, tmp_direction),
            L3D.Tools.sum(L3D.Tools.sum(self.position, left), other),

            L3D.Tools.sum(self.position, tmp_direction),
            L3D.Tools.diff(L3D.Tools.sum(self.position, other),left),

            L3D.Tools.sum(self.position, tmp_direction),
            L3D.Tools.diff(L3D.Tools.diff(self.position, left),other),

            L3D.Tools.sum(self.position, tmp_direction),
            L3D.Tools.sum(L3D.Tools.diff(self.position, other), left)
        ];

        self.line.geometry.vertices = vertices;
        self.line.geometry.verticesNeedUpdate = true;

    })(this, direction, left, other, size);

};
