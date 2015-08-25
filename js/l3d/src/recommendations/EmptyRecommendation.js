/**
 * @memberof L3D
 * @extends BaseRecommendation
 * @description Represents a recommendation not shown and not clickable (for hiding recommendations)
 * @constructor
 */
L3D.EmptyRecommendation = function() {
    L3D.BaseRecommendation.apply(this, arguments);
    this.target = new THREE.Vector3();
};

L3D.EmptyRecommendation.prototype = Object.create(L3D.BaseRecommendation.prototype);
L3D.EmptyRecommendation.prototype.constructor = L3D.EmptyRecommendation;


L3D.EmptyRecommendation.prototype.raycast = function() {};
L3D.EmptyRecommendation.prototype.check = function() {};
L3D.EmptyRecommendation.prototype.initExtremity = function() {};
L3D.EmptyRecommendation.prototype.updateExtremity = function() {};
L3D.EmptyRecommendation.prototype.setSize = function() {};
L3D.EmptyRecommendation.prototype.update = function() {};
L3D.EmptyRecommendation.prototype.regenerateArrow = function() {};
L3D.EmptyRecommendation.prototype.look = function() {};
L3D.EmptyRecommendation.prototype.addToScene = function() {};


