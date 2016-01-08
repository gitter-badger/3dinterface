var PeachScene = function() {

    SceneWithCoins.apply(this, arguments);

    this.coinScale = 0.001;

};

PeachScene.prototype = Object.create(SceneWithCoins.prototype);
PeachScene.prototype.constructor = PeachScene;
PeachScene.super = SceneWithCoins;

PeachScene.prototype.load = function(prefetch) {

    if (prefetch !== undefined) {
        this.prefetchType = prefetch;
    }

    var self = this;

    this.loader = new L3D.ProgressiveLoader(
        '/static/data/castle/princess peaches castle (outside).obj',
        this,
        this.camera,
        function(object) {
            self.clickableObjects.push(object);
            object.raycastable = true;

            if (object.material.name === 'Material.103_princess_peaches_cast') {
                THREEx.Transparency.push(object);
            } else if (object.material.name === 'Material.136_princess_peaches_cast' ||
                       object.material.name === 'Material.135_princess_peaches_cast') {
                THREEx.Transparency.push(object);
                object.material.opacity = 0.5;
                object.raycastable = false;
                object.material.side = THREE.FrontSide;
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

PeachScene.prototype.setCamera = function(camera) {

    PeachScene.super.prototype.setCamera.apply(this, arguments);
    this.camera.speed = 0.001;

}

PeachScene.prototype.getResetElements = function() {

    return {
        position: new THREE.Vector3(0.24120226734236713,0.2009624547018851,-0.5998422840047036),
        target: new THREE.Vector3(0.24120226734232672,0.20096245470190008,-40.5998422840047)
    };

};

PeachScene.prototype.addCoins = function(coinConfig) {

    PeachScene.super.prototype.addCoins.apply(this, [coinConfig, 0.001]);

};

PeachScene.prototype.createCoin = function(position, scale, visible, callback) {

    if (scale === undefined)
        scale = this.coinScale;

    if (visible === undefined)
        visible = true;

    var coin = new Coin(position, scale, visible, callback);
    coin.addToScene(this);
    coin.visible = visible;
    this.coins.push(coin);
    this.collidableObjects.push(coin);
    this.clickableObjects.push(coin);

};

PeachScene.prototype.addRecommendations = function(ClassToInstanciate, width, height) {

    PeachScene.super.prototype.addRecommendations.apply(this, [ClassToInstanciate, width, height, 0.2]);

};

PeachScene.prototype.createRecommendation = function(ClassToInstanciate, width, height, id) {

    PeachScene.super.prototype.createRecommendation.apply(this, [ClassToInstanciate, width, height, 0.2, id]);

};
