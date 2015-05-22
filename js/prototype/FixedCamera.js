// Initialization

// class camera extends THREE.PerspectiveCamera
var FixedCamera = function(arg1, arg2, arg3, arg4, position, target) {
    ArrowCamera.apply(this, arguments);
}
FixedCamera.prototype = Object.create(ArrowCamera.prototype);
FixedCamera.prototype.constructor = FixedCamera;

