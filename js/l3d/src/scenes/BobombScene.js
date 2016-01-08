var BobombScene = function() {

    SceneWithCoins.apply(this, arguments);

};

BobombScene.prototype = Object.create(SceneWithCoins.prototype);
BobombScene.prototype.constructor = BobombScene;
BobombScene.super = SceneWithCoins;

BobombScene.prototype.setCamera = function(camera) {

    BobombScene.super.prototype.setCamera.apply(this, arguments);
    this.camera.speed = 0.005;

};

BobombScene.prototype.load = function(prefetch, lowRes) {

    if (prefetch !== undefined) {
        this.prefetchType = prefetch;
    }

    var self = this;

    var path = lowRes === true ?
        '/static/data/bobomb/bobomb battlefeild.obj' :
        '/static/data/bobomb/bobomb battlefeild_sub.obj';

    this.loader = new L3D.ProgressiveLoader(
        path,
        this,
        this.camera,
        function(object) {
            self.clickableObjects.push(object);
            object.raycastable = true;
            if (object.material.name === 'Material.071_574B138E_c.bmp' ||
                    object.material.name === 'Material.070_41A41EE3_c.bmp') {
                THREEx.Transparency.push(object);
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

BobombScene.prototype.getResetElements = function() {

    return {
        position: new THREE.Vector3(38.115627509754646,10.829803024792419,-19.862035691341315),
        target: new THREE.Vector3(-1.4518898576752122,5.048214777643772,-18.869661407832535)
    };

};

BobombScene.prototype.addRecommendations = function(ClassToInstanciate, width, height) {

    BobombScene.super.prototype.addRecommendations.apply(this, [ClassToInstanciate, width, height, 0.2]);

};
