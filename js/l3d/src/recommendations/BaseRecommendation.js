/**
 * @memberof L3D
 * @description The base class for recommendation
 * @extends THREE.Object3D
 * @constructor
 * @abstract
 */
L3D.BaseRecommendation = function(arg1, arg2, arg3, arg4, position, target) {

    THREE.Object3D.apply(this);

    /**
     * @type {L3D.FixedCamera}
     * @description Camera corresponding to the suggested point of view
     */
    this.camera = new L3D.FixedCamera(arg1, arg2, arg3, arg4, position, target);
    this.add(this.camera);

    var direction = target.clone();
    direction.sub(this.camera.position);
    direction.normalize();

    /**
     * @type {THREE.Vector3}
     * @description Center of the square at the base of the arrow
     */
    this.center = this.camera.position.clone();
    this.center.sub(direction);

    /**
     * @type {THREE.Mesh}
     * @description Body of the arrow
     */
    this.arrow = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({color: 0x0000ff, side:THREE.BackSide}));
    this.add(this.arrow);

    /**
     * @type {Number}
     * @description Size of the meshes
     */
    this.size = 0.4;

    /**
     * @type {THREE.Object3D}
     * @description A container for the displayable objects in the Recommendation
     */
    this.object3D = new THREE.Object3D();

    var tmp = this.initExtremity();

    if (tmp !== undefined)
        this.object3D.add(tmp);

    this.object3D.add(this.arrow);

    this.add(this.object3D);

    this.fullArrow = false;

};
L3D.BaseRecommendation.prototype = Object.create(THREE.Object3D.prototype);
L3D.BaseRecommendation.prototype.constructor = L3D.BaseRecommendation;

/**
 * Changes the color of the meshes like a HTML link
 */
L3D.BaseRecommendation.prototype.check = function() {
    this.traverse(function(obj) {
        if (obj instanceof THREE.Mesh)
            obj.material.color.setHex(0x663366);
    });
};

/**
 * Initialize the extremity of the arrow
 */
L3D.BaseRecommendation.prototype.initExtremity = function() {
    var geometry = new THREE.Geometry();

    var direction = this.camera.target.clone();
    direction.sub(this.camera.position);
    direction.normalize();

    var left = L3D.Tools.cross(direction, this.up);
    var other = L3D.Tools.cross(direction, left);


    left.normalize();
    other.normalize();
    left = L3D.Tools.mul(left, this.size);
    other  = L3D.Tools.mul(other, this.size);

    geometry.vertices.push(L3D.Tools.sum( L3D.Tools.sum( this.camera.position, left),  other),
                           L3D.Tools.diff(L3D.Tools.sum( this.camera.position, other), left),
                           L3D.Tools.diff(L3D.Tools.diff(this.camera.position, left),  other),
                           L3D.Tools.sum( L3D.Tools.diff(this.camera.position, other), left),
                           L3D.Tools.sum(this.camera.position, direction)
                          );

    geometry.faces.push(new THREE.Face3(0,2,1), // new THREE.Face3(0,2,1),
                        new THREE.Face3(0,3,2),  // new THREE.Face3(0,3,2)
                        new THREE.Face3(4,1,2),
                        new THREE.Face3(4,0,1),
                        new THREE.Face3(4,3,0),
                        new THREE.Face3(4,2,3)
                        );

    geometry.computeFaceNormals();

    var material = new THREE.MeshLambertMaterial({
        color : 0x0000ff,
        transparent : true,
        opacity : 0.5,
        side: THREE.FrontSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    return this.mesh;
};

/**
 * Updates the extremity of the arrow
 */
L3D.BaseRecommendation.prototype.updateExtremity = function() {
    var direction = this.camera.target.clone();
    direction.sub(this.camera.position);
    direction.normalize();

    var left = L3D.Tools.cross(direction, this.up);
    var other = L3D.Tools.cross(direction, left);

    left.normalize();
    other.normalize();
    left = L3D.Tools.mul(left, this.size);
    other  = L3D.Tools.mul(other, this.size);

    this.mesh.geometry.vertices = [
        L3D.Tools.sum( L3D.Tools.sum( this.camera.position, left),  other),
        L3D.Tools.diff(L3D.Tools.sum( this.camera.position, other), left),
        L3D.Tools.diff(L3D.Tools.diff(this.camera.position, left),  other),
        L3D.Tools.sum( L3D.Tools.diff(this.camera.position, other), left),
        L3D.Tools.sum(this.camera.position, direction)
    ];

    this.mesh.geometry.computeFaceNormals();
    this.mesh.geometry.verticesNeedUpdate = true;

};

/**
 * Changes the size of the element
 * @param size {Number} new size
 * @deprecated this function doesn't work since there are lots of things to
 * keep in mind (length of the arrow, width, size of the body, size of the
 * extremity...)
 */
L3D.BaseRecommendation.prototype.setSize = function(size) {
    this.size = size;
    this.updateExtremity();
};

/**
 * Updates the arrow. The arrow is moving according to the position of the camera
 * @param {Object} a camera containing two THREE.Vector3 (position, and target)
 */
L3D.BaseRecommendation.prototype.update = function(mainCamera) {
    // Compute distance between center of camera and position
    dist = L3D.Tools.norm2(L3D.Tools.diff(mainCamera.position, this.center));

    var low_bound = 1;
    var high_bound = 5;
    var new_value;

    if (dist < low_bound) {
        new_value = 0;
    }
    else if (dist > high_bound) {
        new_value = 1;
    }
    else {
        new_value = (dist - low_bound)/(high_bound - low_bound);
    }

    // Update opacity
    this.object3D.traverse(function(elt) {
        if (elt instanceof THREE.Mesh) {
            elt.material.transparent =   new_value < 0.9;
            elt.material.opacity = new_value;

            if (new_value < 0.1)
                elt.material.transparent = elt.visible = false;
        }
    });

    this.regenerateArrow(mainCamera);
};

/**
 * Regenerates the arrow according to the position of the camera
 * @param {Object} a camera containing two THREE.Vector3 (position, and target)
 */
L3D.BaseRecommendation.prototype.regenerateArrow = function(mainCamera) {
    var i;
    var vertices = [];

    // First point of curve
    var f0 = mainCamera.position.clone();
    f0.add(L3D.Tools.mul(L3D.Tools.sum(new THREE.Vector3(0,-0.5,0), L3D.Tools.diff(this.camera.target, this.camera.position).normalize()),2));

    // Last point of curve
    var f1 = this.camera.position.clone();

    // Last derivative of curve
    var fp1 = L3D.Tools.diff(this.camera.target, this.camera.position);
    fp1.normalize();
    fp1.multiplyScalar(2);

    // Camera direction
    var dir = L3D.Tools.diff(this.camera.position, mainCamera.position);
    dir.normalize();

    if (fp1.dot(dir) < -0.5) {
        // Regen polynom with better stuff
        if (mainCamera.position.y > this.camera.position.y) {
            f0.add(new THREE.Vector3(0,2,0));
        } else {
            f0.add(new THREE.Vector3(0,-2,0));
        }

    }

    fp1.multiplyScalar(4);

    var hermite = new L3D.Hermite.special.Polynom(f0, f1, fp1);

    var up = this.up.clone();
    var point;
    var deriv;
    var limit = this.fullArrow ? 0.1 : 0.3;

    for (i = 1; i > limit; i -= 0.1) {
        point = hermite.eval(i);
        deriv = hermite.prime(i);
        up.cross(deriv);
        up.cross(deriv);
        up.multiplyScalar(-1);
        up.normalize();

        var coeff = this.size / 2;
        var left = L3D.Tools.cross(up, deriv);     left.normalize(); left.multiplyScalar(coeff);
        var other = L3D.Tools.cross(deriv, left);  other.normalize(); other.multiplyScalar(coeff);

        vertices.push(
            L3D.Tools.sum(L3D.Tools.sum(point, left), other),
            L3D.Tools.sum(L3D.Tools.diff(point, left), other),
            L3D.Tools.diff(point, L3D.Tools.sum(other,left)),
            L3D.Tools.sum(L3D.Tools.diff(point, other), left)
        );
    }

    this.arrow.geometry.vertices = vertices;

    if (this.arrow.geometry.faces.length === 0) {
        var faces = [];

        for (i = 0; i < vertices.length - 4; i+= 4) {
            faces.push(new THREE.Face3(i,i+1,i+5),new THREE.Face3(i,i+5,i+4),
                       new THREE.Face3(i+1,i+2,i+6),new THREE.Face3(i+1,i+6,i+5),
                       new THREE.Face3(i+2,i+3,i+7),new THREE.Face3(i+2,i+7,i+6),
                       new THREE.Face3(i,i+7,i+3), new THREE.Face3(i,i+4,i+7));
        }

        var len = vertices.length;
        faces.push(new THREE.Face3(len-4,len-3,len-2), new THREE.Face3(len-4,len-2,len-1));

        // Faces changed, update them
        this.arrow.geometry.faces = faces;
        this.arrow.geometry.groupsNeedUpdate = true;
        this.arrow.geometry.elementsNeedUpdate = true;
    }

    this.arrow.geometry.computeFaceNormals();
    this.arrow.geometry.computeBoundingSphere();

    // Vertices and normals changed, update them
    this.arrow.geometry.dynamic = true;
    this.arrow.geometry.verticesNeedUpdate = true;
    this.arrow.geometry.normalsNeedUpdate = true;

};

/**
 * Look at function. Just like OpenGL gluLookAt (from position to target)
 */
L3D.BaseRecommendation.prototype.look = function() {
    this.camera.look();
};

/**
 * Add the camera and its mesh representation to the scene
 * @param scene {THREE.Scene} scene to add the camera to
 */
L3D.BaseRecommendation.prototype.addToScene = function(scene) {
    scene.add(this);
};
