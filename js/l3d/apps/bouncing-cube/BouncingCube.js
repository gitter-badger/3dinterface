var BouncingCube = function(size, style) {
    L3D.Cube.call(this, size, style);

    this.fixedCenter = new THREE.Vector3();
    this.center = new THREE.Vector3();

    this.speed = new THREE.Vector3(0,0,300);
};
BouncingCube.prototype = Object.create(L3D.Cube.prototype);
BouncingCube.prototype.constructor = BouncingCube;

BouncingCube.prototype.update = function() {
    // Compute new center
    var speedClone = this.speed.clone();
    speedClone.multiply(BouncingCube.DT);

    this.speed.add(BouncingCube.G);

    if (this.speed.dot(this.speed) > 100) {
        this.center.add(speedClone);
    }

    if (this.center.z < 0) {
        this.speed.multiply(BouncingCube.FRICTION);
        this.center.z = 0;
    }

    // Update the mesh
    this.mesh.position.set(this.center.x, this.center.y, this.center.z);
};

// Static variables
BouncingCube.DT = new THREE.Vector3(0.1,0.1,0.1);
BouncingCube.FRICTION = new THREE.Vector3(1, 1, -0.5);
BouncingCube.G = new THREE.Vector3(0,0,-10);

