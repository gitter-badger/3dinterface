var MountainScene = function() {

    SceneWithCoins.apply(this, arguments);

};

MountainScene.prototype = Object.create(SceneWithCoins.prototype);
MountainScene.prototype.constructor = MountainScene;
MountainScene.super = SceneWithCoins;

MountainScene.prototype.setCamera = function(camera) {

    MountainScene.super.prototype.setCamera.apply(this, arguments);
    this.camera.speed = 0.005;

};

MountainScene.prototype.load = function(prefetch, lowRes) {

    if (prefetch !== undefined) {
        this.prefetchType = prefetch;
    }

    var self = this;

    var path = lowRes === true ?
        '/static/data/mountain/coocoolmountain.obj':
        '/static/data/mountain/coocoolmountain_sub.obj';


    this.loader = new L3D.ProgressiveLoader(
        path,
        this,
        this.camera,
        function(object) {
            // object.rotation.x = -Math.PI/2;
            // object.rotation.z = Math.PI/2;
            self.clickableObjects.push(object);
            object.raycastable = true;
            if (object.material.name === 'Material.070_13F025D5_c2.png' ||
                object.material.name === 'Material.068_5972FC88_c.bmp' ||
                object.material.name === 'Material.073_76F611AD_c.bmp' ||
                object.material.name === 'Material.071_76F611AD_c.bmp' ||
                object.material.name === 'Material.072_1723CCC7_c.bmp' ||
                object.material.name === 'Material.069_78B64DC7_c.bmp' ||
                object.material.name === 'Material.070_13F025D5_c.bmp' ||
                object.material.name === 'Material.078_3165B23A_c.bmp' ||
                object.material.name === 'Material.067_1723CCC7_c.bmp' ||
                object.material.name === 'Material.066_36DB292F_c.bmp') {
                THREEx.Transparency.push(object);
            } else if (object.material.name === 'Material.082_6DAF90F6_c.bmp') {
                THREEx.Transparency.push(object);
                object.material.opacity = 0.5;
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

MountainScene.prototype.getResetElements = function() {

    return {
        position : new THREE.Vector3(-20.558328115300082,23.601312087942762,-10.220633604814038),
        target : new THREE.Vector3(11.025356711105232,11.969889531789319,11.393733425161644)
    };

};
