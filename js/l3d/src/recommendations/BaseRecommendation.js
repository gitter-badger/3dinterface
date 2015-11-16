/**
 * @description Represents a reccomendation that does nothing
 * @constructor
 * @extends THREE.Object3D
 */
L3D.BaseRecommendation = function() {

    THREE.Object3D.apply(this, arguments);

    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.copy(arguments[4]);
    this.camera.target = arguments[5];

};

L3D.BaseRecommendation.prototype = Object.create(THREE.Object3D.prototype);
L3D.BaseRecommendation.prototype.constructor = L3D.BaseRecommendation;

// Base recommendation behaves like no recommendation : all its methods do nothing
L3D.BaseRecommendation.prototype.raycast = function() {};
L3D.BaseRecommendation.prototype.check = function() {};
L3D.BaseRecommendation.prototype.initExtremity = function() {};
L3D.BaseRecommendation.prototype.updateExtremity = function() {};
L3D.BaseRecommendation.prototype.setSize = function() {};
L3D.BaseRecommendation.prototype.update = function() {};
L3D.BaseRecommendation.prototype.regenerateArrow = function() {};
L3D.BaseRecommendation.prototype.look = function() {};
L3D.BaseRecommendation.prototype.addToScene = function() {};
