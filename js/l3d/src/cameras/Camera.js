L3D.Camera = function() {
    THREE.PerspectiveCamera.apply(this, arguments);

    this.theta = 0;
    this.position.x = L3D.Camera.DISTANCE_X;
    this.position.z = L3D.Camera.DISTANCE_Z;

    this.up = new THREE.Vector3(0,0,1);
    this.target = new THREE.Vector3();
};
L3D.Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

// Update function
L3D.Camera.prototype.update = function(time) {
    if (time === undefined) {
        time = 20;
    }
    this.theta += 0.01 * time / 20;
    this.position.x = L3D.Camera.DISTANCE_X*Math.cos(this.theta);
    this.position.y = L3D.Camera.DISTANCE_X*Math.sin(this.theta);
};

// Look function
L3D.Camera.prototype.look = function() {
    this.lookAt(this.target);
};

// Static members
L3D.Camera.DISTANCE_X = 1000;
L3D.Camera.DISTANCE_Z = 300;
