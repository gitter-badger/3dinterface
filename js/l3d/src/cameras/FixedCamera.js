/**
 * Represents a fixed camera
 * @constructor
 * @extends THREE.PerspectiveCamera
 * @memberof L3D
 */
L3D.FixedCamera = function(arg1, arg2, arg3, arg4, position, target) {
    THREE.PerspectiveCamera.apply(this, arguments);

    if (position === undefined) {

        position = new THREE.Vector3(0,0,5);

    }

    if (target === undefined ) {

        target = new THREE.Vector3();

    }

    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;

    this.target = target.clone();

};
L3D.FixedCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
L3D.FixedCamera.prototype.constructor = L3D.FixedCamera;

/**
 * Look function. Just like OpenGL gluLookAt
 */
L3D.FixedCamera.prototype.look = function() {
    this.lookAt(this.target);
};
