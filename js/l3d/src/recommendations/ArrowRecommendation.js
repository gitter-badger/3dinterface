// Initialization

// class camera extends THREE.PerspectiveCamera
L3D.ArrowRecommendation = function(arg1, arg2, arg3, arg4, position, target) {
    L3D.BaseRecommendation.apply(this, arguments);
};
L3D.ArrowRecommendation.prototype = Object.create(L3D.BaseRecommendation.prototype);
L3D.ArrowRecommendation.prototype.constructor = L3D.ArrowRecommendation;

