/**
 * Class that represents a scene that can contain recommendations
 * @constructor
 * @augments THREE.Scene
 */
L3D.Scene = function() {

    THREE.Scene.apply(this, arguments);

    /**
     * The objects that the camera can collide
     * @type {THREE.Object3D[]}
     */
    this.collidableObjects = [];

    /**
     * The objects that the click can collide. Every object that could hide
     * another from the click should be in this array
     * @type {THREE.Object3D[]}
     */
    this.clickableObjects = [];

    /**
     * The pointer camera associated with the scene (and the loading)
     * @type {L3D.PointerCamera}
     * @private
     */
    this.camera = null;

    /**
     * The progressive loader that will load the elements from the scene
     * @type {L3D.ProgressiveLoader}
     *@private
     */
    this.loader = null;

    /**
     * Default prefetching policy
     * @type {String}
     */
    this.prefetchType = 'NV-PN';

    /**
     * Array for recommendations
     * @type {L3D.BaseRecommendation[]}
     */
    this.recommendations = [];

    /**
     * Functions to call when loading is finished
     * @type {function[]}
     */
    this.onLoad = [];


    var directionalLight = new THREE.DirectionalLight(0x777777);
    directionalLight.position.set(1, 1, 0).normalize();
    directionalLight.castShadow = false;
    this.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0xbbbbbb);
    this.add(ambientLight);

};

L3D.Scene.prototype = Object.create(THREE.Scene.prototype);
L3D.Scene.prototype.constructor = L3D.Scene;

/**
 * Sets the camera of the scene
 * @param camera {L3D.PointerCamera} the camera associated with the loading of the scene
 */
L3D.Scene.prototype.setCamera = function(camera) {

    this.camera = camera;
    this.camera.resetElements = this.getResetElements();
    this.camera.reset();

    if (this.loader instanceof L3D.ProgressiveLoader)
        this.loader.camera = camera;

};

/**
 * Loads the models from the scene
 * @param {String} prefetch prefetching policy
 */
L3D.Scene.prototype.load = function(prefetch) {

    // Nothing to load for an empty scene

};

/**
 * Gets the reset elements of the scene
 * @return {Object} an object containing position and target, two THREE.Vector3
 */
L3D.Scene.prototype.getResetElements = function() {

    return {
        position: new THREE.Vector3(),
        target:   new THREE.Vector3()
    };

};

L3D.Scene.prototype.addRecommendations = function(ClassToInstanciate, width, height, recoSize) {

    var createRecommendation = function() {
        return new ClassToInstanciate(
            50,
            width/height,
            1,
            100000,
            new THREE.Vector3().copy(arguments[0].position),
            new THREE.Vector3().copy(arguments[0].target)
        );
    };

    for (var i = 0; i < this.constructor.recommendations.length; i++) {

        var reco = createRecommendation(this.constructor.recommendations[i]);
        this.recommendations.push(reco);
        reco.addToScene(this);
        this.clickableObjects.push(reco);

        if (recoSize !== undefined)
            reco.setSize(recoSize);

    }

};

L3D.Scene.prototype.createRecommendation = function(ClassToInstanciate, width, height, recoSize, id) {

    var createRecommendation = function() {
        return new ClassToInstanciate(
            50,
            width/height,
            1,
            100000,
            new THREE.Vector3().copy(arguments[0].position),
            new THREE.Vector3().copy(arguments[0].target)
        );
    };

    var reco = createRecommendation(this.constructor.recommendations[id]);
    this.recommendations.push(reco);
    reco.addToScene(this);
    this.clickableObjects.push(reco);

    if (recoSize !== undefined)
        reco.setSize(recoSize);
};

L3D.Scene.prototype.addEventListener = function(event, callback) {

    switch (event) {
        case 'onload':
            this.onLoad.push(callback);
            break;
        default:
            console.warn('Event ignored');
            break;
    }

};

L3D.Scene.prototype.finish = function() {

    console.log(this.onLoad);
    this.onLoad.map(function(f) { f(); });

};
