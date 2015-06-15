// class camera extends THREE.PerspectiveCamera
var Camera = function() {
    THREE.PerspectiveCamera.apply(this, arguments);

    this.theta = 0;
    this.position.x = Camera.DISTANCE_X;
    this.position.z = Camera.DISTANCE_Z;

    this.up = new THREE.Vector3(0,0,1);
    this.target = new THREE.Vector3();
}
Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

// Update function
Camera.prototype.update = function(time) {
    if (time === undefined) {
        time = 20;
    }
    this.theta += 0.01 * time / 20;
    this.position.x = Camera.DISTANCE_X*Math.cos(this.theta);
    this.position.y = Camera.DISTANCE_X*Math.sin(this.theta);
}

// Look function
Camera.prototype.look = function() {
    this.lookAt(this.target);
}

// Static members
Camera.DISTANCE_X = 1000;
Camera.DISTANCE_Z = 300;
