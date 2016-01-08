var WhompScene = function() {

    SceneWithCoins.apply(this, arguments);

};

WhompScene.prototype = Object.create(SceneWithCoins.prototype);
WhompScene.prototype.constructor = WhompScene;
WhompScene.super = SceneWithCoins;

WhompScene.prototype.setCamera = function(camera) {

    WhompScene.super.prototype.setCamera.apply(this, arguments);
    this.camera.speed = 0.002;

};

WhompScene.prototype.load = function(prefetch, lowRes) {

    if (prefetch !== undefined) {
        this.prefetchType = prefetch;
    }

    var self = this;

    var path = lowRes === true ?
        '/static/data/whomp/Whomps Fortress.obj':
        '/static/data/whomp/Whomps Fortress_sub.obj';

    this.loader = new L3D.ProgressiveLoader(
        path,
        this,
        this.camera,
        function(object) {

            self.clickableObjects.push(object);
            object.raycastable = true;
            if (object.material.name === 'Shape_088' ||
                object.material.name === 'Shape_089') {
                object.raycastable = false;
                THREEx.Transparency.push(object);
            } else if (object.material.name === 'Shape_113') {
                THREEx.Transparency.push(object);
                object.raycastable = false;
                object.material.opacity = 0.5;
            } else if (object.material.name === 'Shape_076' ||
                       object.material.name === 'Shape_098' ||
                       object.material.name === 'Shape_092') {
                object.visible = false;
            }

        },
        L3D.LogFunction,
        false,
        this.prefetchType
    );

    this.loader.onFinished = function() { self.finish(); };
    this.loader.load();

    this.collidableObjects.push(this.loader.obj);
    this.clickableObjects.push(this.loader.obj);
    this.loader.obj.raycastable = true;

};

WhompScene.prototype.getResetElements = function() {

    return {
        position : new THREE.Vector3(-6.725817925071645,1.4993570618328055,-10.356480813212423),
        target : new THREE.Vector3(-4.8541705829784604,1.3192268872752742,-6.825972443720941)
    };

};

WhompScene.prototype.addCoins = function(coinConfig) {

    WhompScene.super.prototype.addCoins.apply(this, [coinConfig, 0.002]);

};

WhompScene.prototype.addRecommendations = function(ClassToInstanciate, width, height) {

    WhompScene.super.prototype.addRecommendations.apply(this, [ClassToInstanciate, width, height, 0.2]);

}
