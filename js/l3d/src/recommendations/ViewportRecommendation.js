/**
 * @memberof L3D
 * @extends L3D.BaseRecommendation
 * @description Reprensents a recommendation as a viewport (3D representation of a camera)
 * @constructor
 */
L3D.ViewportRecommendation = function(arg1, arg2, arg3, arg4, position, target) {
    L3D.BaseRecommendation.apply(this, arguments);

    if (target === undefined)
        target = new THREE.Vector3(0,0,0);

    var direction = target.clone();
    direction.sub(this.camera.position);
    direction.normalize();

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

    geometry.vertices.push(L3D.Tools.sum(L3D.Tools.sum(this.camera.position, left), other),
                           L3D.Tools.diff(L3D.Tools.sum(this.camera.position, other),left),
                           L3D.Tools.diff(L3D.Tools.diff(this.camera.position, left),other),
                           L3D.Tools.sum(L3D.Tools.diff(this.camera.position, other), left)
                          );

    geometry.faces.push(new THREE.Face3(0,1,2), // new THREE.Face3(0,2,1),
                        new THREE.Face3(0,2,3)  // new THREE.Face3(0,3,2)
                        );

    (function(self, direction, left, other) {
        var material = new THREE.LineBasicMaterial({ color: '0x000000'});
        var geometry = new THREE.Geometry();
        var tmp_direction = L3D.Tools.mul(direction, -2);
        var target = L3D.Tools.sum(self.camera.position, tmp_direction);
        // geometry.vertices.push(self.camera.position, target);
        geometry.vertices.push(
            L3D.Tools.sum(L3D.Tools.sum(self.camera.position, left), other),
            L3D.Tools.diff(L3D.Tools.sum(self.camera.position, other),left),
            L3D.Tools.diff(L3D.Tools.diff(self.camera.position, left),other),
            L3D.Tools.sum(L3D.Tools.diff(self.camera.position, other), left),
            L3D.Tools.sum(L3D.Tools.sum(self.camera.position, left), other),
            L3D.Tools.sum(L3D.Tools.diff(self.camera.position, other), left),

            L3D.Tools.sum(self.camera.position, tmp_direction),
            L3D.Tools.sum(L3D.Tools.sum(self.camera.position, left), other),

            L3D.Tools.sum(self.camera.position, tmp_direction),
            L3D.Tools.diff(L3D.Tools.sum(self.camera.position, other),left),

            L3D.Tools.sum(self.camera.position, tmp_direction),
            L3D.Tools.diff(L3D.Tools.diff(self.camera.position, left),other),

            L3D.Tools.sum(self.camera.position, tmp_direction),
            L3D.Tools.sum(L3D.Tools.diff(self.camera.position, other), left)
        );

        self.line = new THREE.Line(geometry, material);
    })(this, direction, left, other);

    (function(self, direction, left, other) {

        var material = new THREE.MeshBasicMaterial();
        var geometry = new THREE.Geometry();
        var tmp_direction = L3D.Tools.mul(direction, -2);

        geometry.vertices = [
            L3D.Tools.sum(L3D.Tools.sum(self.camera.position, left), other),
            L3D.Tools.diff(L3D.Tools.sum(self.camera.position, other),left),
            L3D.Tools.diff(L3D.Tools.diff(self.camera.position, left),other),
            L3D.Tools.sum(L3D.Tools.diff(self.camera.position, other), left),
            L3D.Tools.sum(self.camera.position, tmp_direction)
        ];

        geometry.faces = [

            new THREE.Face3(0, 1, 2),
            new THREE.Face3(0, 2, 3),
            new THREE.Face3(0, 4, 1),
            new THREE.Face3(1, 4, 2),
            new THREE.Face3(4, 3, 2),
            new THREE.Face3(4, 0, 3)

        ];

        self.collidingObject = new THREE.Mesh(geometry, material);

    })(this, direction, left, other);


    var material = new THREE.MeshBasicMaterial({
        color : 0x0000ff,
        transparent : true,
        opacity : 1,
        side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.raycastable = true;

    this.object3D = new THREE.Object3D();
    this.object3D.add(this.mesh);
    this.object3D.add(this.line);
    this.add(this.object3D);

};
L3D.ViewportRecommendation.prototype = Object.create(L3D.BaseRecommendation.prototype);
L3D.ViewportRecommendation.prototype.constructor = L3D.ViewportRecommendation;

L3D.ViewportRecommendation.prototype.raycast = function(raycaster, intersects) {

    var intersectsThis = [];
    this.collidingObject.raycast(raycaster, intersectsThis);

    if (intersectsThis[0] !== undefined) {

        intersectsThis[0].object = this;
        intersects.push(intersectsThis[0]);

    }

};

L3D.ViewportRecommendation.prototype.check = function() {
    this.mesh.material.color.setHex(0x663366);
};

L3D.ViewportRecommendation.prototype.initExtremity = function() {
    // Do nothing
};

// Update function
L3D.ViewportRecommendation.prototype.update = function(position) {
    // Compute distance between center of camera and position
    dist = L3D.Tools.norm2(L3D.Tools.diff(position.position, this.camera.position));

    var low_bound = 0.5;
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

    this.raycastable = this.line.visible = this.mesh.material.transparent = this.mesh.visible = new_value > 0.1;
};

L3D.ViewportRecommendation.prototype.setSize = function(size) {

    var direction = this.camera.target.clone();
    direction.sub(this.camera.position);
    direction.normalize();

    var left = L3D.Tools.cross(direction, this.up);
    var other = L3D.Tools.cross(direction, left);
    left.normalize();
    other.normalize();
    left = L3D.Tools.mul(left, size);
    other  = L3D.Tools.mul(other, size);

    this.mesh.geometry.vertices = [
        L3D.Tools.sum(L3D.Tools.sum(this.camera.position, left), other),
        L3D.Tools.diff(L3D.Tools.sum(this.camera.position, other),left),
        L3D.Tools.diff(L3D.Tools.diff(this.camera.position, left),other),
        L3D.Tools.sum(L3D.Tools.diff(this.camera.position, other), left)
    ];

    this.mesh.geometry.verticesNeedUpdate = true;

    (function(self, direction, left, other, size) {

        var tmp_direction = L3D.Tools.mul(direction, -2 * size);
        var target = L3D.Tools.sum(self.camera.position, tmp_direction);

        var vertices = [
            L3D.Tools.sum(L3D.Tools.sum(self.camera.position, left), other),
            L3D.Tools.diff(L3D.Tools.sum(self.camera.position, other),left),
            L3D.Tools.diff(L3D.Tools.diff(self.camera.position, left),other),
            L3D.Tools.sum(L3D.Tools.diff(self.camera.position, other), left),
            L3D.Tools.sum(L3D.Tools.sum(self.camera.position, left), other),
            L3D.Tools.sum(L3D.Tools.diff(self.camera.position, other), left),

            L3D.Tools.sum(self.camera.position, tmp_direction),
            L3D.Tools.sum(L3D.Tools.sum(self.camera.position, left), other),

            L3D.Tools.sum(self.camera.position, tmp_direction),
            L3D.Tools.diff(L3D.Tools.sum(self.camera.position, other),left),

            L3D.Tools.sum(self.camera.position, tmp_direction),
            L3D.Tools.diff(L3D.Tools.diff(self.camera.position, left),other),

            L3D.Tools.sum(self.camera.position, tmp_direction),
            L3D.Tools.sum(L3D.Tools.diff(self.camera.position, other), left)
        ];

        self.line.geometry.vertices = vertices;
        self.line.geometry.verticesNeedUpdate = true;

    })(this, direction, left, other, size);

    (function(self, direction, left, other) {

        var tmp_direction = L3D.Tools.mul(direction, -2 * size);

        self.collidingObject.geometry.vertices = [
            L3D.Tools.sum(L3D.Tools.sum(self.camera.position, left), other),
            L3D.Tools.diff(L3D.Tools.sum(self.camera.position, other),left),
            L3D.Tools.diff(L3D.Tools.diff(self.camera.position, left),other),
            L3D.Tools.sum(L3D.Tools.diff(self.camera.position, other), left),
            L3D.Tools.sum(self.camera.position, tmp_direction)
        ];

    })(this, direction, left, other, size);

    this.collidingObject.verticesNeedUpdate = true;

};
