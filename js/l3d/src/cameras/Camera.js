/**
 * Reprensents a simple rotating camera
 * @constructor
 * @memberof L3D
 * @extends THREE.PerspectiveCamera
 */
L3D.Camera = function() {
    THREE.PerspectiveCamera.apply(this, arguments);

    /**
     * @type {Number}
     * @description angle of the camera
     */
    this.theta = 0;

    this.position.x = L3D.Camera.DISTANCE_X;
    this.position.z = L3D.Camera.DISTANCE_Z;

    this.up = new THREE.Vector3(0,0,1);

    /**
     * @type {THREE.Vector3}
     * @description Position where the camera is looking at
     */
    this.target = new THREE.Vector3();
};
L3D.Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

/**
 * Updates the position of the camera
 * @param time {Number} time elapsed since the last update in millisec
 */
L3D.Camera.prototype.update = function(time) {
    if (time === undefined) {
        time = 20;
    }
    this.theta += 0.01 * time / 20;
    this.position.x = L3D.Camera.DISTANCE_X*Math.cos(this.theta);
    this.position.y = L3D.Camera.DISTANCE_X*Math.sin(this.theta);
};

/**
 * look function. Just like OpenGL gluLookAt
 */
L3D.Camera.prototype.look = function() {
    this.lookAt(this.target);
};

/**
 * @static
 * @type {Number}
 * @description radiusof the circle where the camera is rotating
 */
L3D.Camera.DISTANCE_X = 1000;

/**
 * @static
 * @type {Number}
 * @description Altitude of the camera
 */
L3D.Camera.DISTANCE_Z = 300;
