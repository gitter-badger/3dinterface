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
    this.target.add(Tools.mul(direction,20));
    // this.up = new THREE.Vector3(0,0,1);

    // Compute corners

    // Create the mesh to draw

    var geometry = new THREE.Geometry();

    this.center = this.position.clone();
    var left = Tools.cross(direction, this.up);
    var other = Tools.cross(direction, left);

    this.center.sub(direction);

    left.normalize();
    other.normalize();
    left = Tools.mul(left, 0.2);
    other  = Tools.mul(other, 0.2);

    geometry.vertices.push(Tools.sum( Tools.sum( this.position, left),  other),
                           Tools.diff(Tools.sum( this.position, other), left),
                           Tools.diff(Tools.diff(this.position, left),  other),
                           Tools.sum( Tools.diff(this.position, other), left),
                           Tools.sum(this.position, direction)
                          );

    geometry.faces.push(new THREE.Face3(0,1,2), // new THREE.Face3(0,2,1),
                        new THREE.Face3(0,2,3),  // new THREE.Face3(0,3,2)
                        new THREE.Face3(4,1,2),
                        new THREE.Face3(4,0,1),
                        new THREE.Face3(4,3,0),
                        new THREE.Face3(4,2,3)
                        );

    geometry.computeFaceNormals();

    (function(self, direction, left, other, position) {
        var material = new THREE.LineBasicMaterial({ color: '0x000000', transparent: true});
        var geometry = new THREE.Geometry();
        // var direction = Tools.mul(direction, 1);
        var target = Tools.sum(position, direction);
        // geometry.vertices.push(position, target);
        geometry.vertices.push(
            Tools.sum(Tools.sum(position, left), other),
            Tools.diff(Tools.sum(position, other),left),
            Tools.diff(Tools.diff(position, left),other),
            Tools.sum(Tools.diff(position, other), left),
            Tools.sum(Tools.sum(position, left), other),
            Tools.sum(Tools.diff(position, other), left),

            Tools.sum(position, direction),
            Tools.sum(Tools.sum(position, left), other),

            Tools.sum(position, direction),
            Tools.diff(Tools.sum(position, other),left),

            Tools.sum(position, direction),
            Tools.diff(Tools.diff(position, left),other),

            Tools.sum(position, direction),
            Tools.sum(Tools.diff(position, other), left)
        );

        self.border = new THREE.Line(geometry, material);
    })(this, direction, left, other, position);


    var material = new THREE.MeshLambertMaterial({
        color : 0xff0000,
        transparent : true,
        opacity : 0.5,
        side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.arrow = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xff0000}), THREE.LinePieces);
    this.arrow.material.linewidth=10;
    this.arrow.geometry.vertices.push(new THREE.Vector3());
    this.arrow.geometry.vertices.push(new THREE.Vector3());
    this.arrow.geometry.vertices[0] = new THREE.Vector3();// mainCamera.position.clone();
    this.arrow.geometry.vertices[1] = this.position.clone();
}
FixedCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
FixedCamera.prototype.constructor = FixedCamera;

// Update function
FixedCamera.prototype.update = function(mainCamera) {
    // Compute distance between center of camera and position
    dist = Tools.norm2(Tools.diff(mainCamera.position, this.center));

    var low_bound = 1;
    var high_bound = 5;
    var new_value;

    if (dist < low_bound) {
        new_value = 0;
    }
    else if (dist > high_bound) {
        new_value = 1;
    }
    else {
        new_value = (dist - low_bound)/(high_bound - low_bound);
    }

    // Update opacity
    this.mesh.material.transparent =   new_value < 0.9;
    this.border.material.transparent = new_value < 0.9;
    this.arrow.material.transparent =  new_value < 0.9;
    this.mesh.material.opacity = new_value;
    this.border.material.opacity = new_value;
    this.arrow.material.opacity = new_value;

    this.regenerateArrow(mainCamera);
}

FixedCamera.prototype.regenerateArrow = function(mainCamera) {
    var vertices = new Array();
    var t = [0,1];
    var f = [mainCamera.position.clone(), this.position.clone()];
    var fp = [Tools.diff(mainCamera.target, mainCamera.position), Tools.diff(this.target, this.position)];
    var hermite = new Hermite.Polynom(t,f,fp);

    vertices.push(hermite.eval(0.5));
    for (var i = 0.5; i <= 1.001; i += 0.05) {
        var point = hermite.eval(i);
        vertices.push(point, point);
    }

    this.arrow.geometry.vertices = vertices;

    // this.arrow.geometry.vertices[0] = new THREE.Vector3(); // mainCamera.position.clone();
    // this.arrow.geometry.vertices[1] = this.position.clone();

    this.arrow.geometry.dynamic = true;
    this.arrow.geometry.verticesNeedUpdate = true;
    this.arrow.geometry.elementsNeedUpdate = true;
    this.arrow.geometry.groupsNeedUpdate = true;
    this.arrow.geometry.normalsNeedUpdate = true;

}

// Look function
FixedCamera.prototype.look = function() {
    this.lookAt(this.target);
}

FixedCamera.prototype.addToScene = function(scene) {
    scene.add(this);
    scene.add(this.mesh);
    scene.add(this.border);
    scene.add(this.arrow);
}

FixedCamera.prototype.traverse = function(callback) {
    callback(this.mesh);
    callback(this.border);
}
