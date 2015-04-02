DT = new THREE.Vector3(0.1,0.1,0.1);
FRICTION = new THREE.Vector3(1, 1, 1);
G = new THREE.Vector3(0,0,-10);

var BouncingCube = function(size, style) {
    Cube.call(this, size, style);

    this.fixed_center = new THREE.Vector3();
    this.center = new THREE.Vector3();

    this.speed = new THREE.Vector3(0,0,300);
}
BouncingCube.prototype = Object.create(Cube.prototype);
BouncingCube.prototype.constructor = BouncingCube;

BouncingCube.prototype.update = function() {
    // Compute new center
    var speed_clone = this.speed.clone();
    speed_clone.multiply(DT);

    this.speed.add(G);

    if (this.speed.dot(this.speed) > 100) {
        this.center.add(speed_clone);
    }

    if (this.center.z < 0) {
        this.speed.multiply(new THREE.Vector3(1,1,-0.5));
        this.center.z = 0;
    }

    // Update the mesh
    this.mesh.position.set(this.center.x, this.center.y, this.center.z);

    // console.log(this.center.x, this.center.y, this.center.z);
}
