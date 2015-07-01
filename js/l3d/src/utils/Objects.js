L3D.Displayable = function() {
    // Nothing to do here
};

L3D.Displayable.prototype.addToScene = function(scene) {
    scene.add(this.mesh);
};

L3D.Displayable.prototype.translate = function(x,y,z) {
    this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(x,y,z));
};

// class L3D.Cube extends L3D.Displayable
L3D.Cube = function(size, style) {
    // Super constructor call
    L3D.Displayable.call(this);

    if (size  === undefined) size = 100;
    if (style === undefined) style = {};

    this.geometry = new THREE.BoxGeometry(size, size, size);

    this.material = new THREE.MeshLambertMaterial(style);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = false;
};
L3D.Cube.prototype = Object.create(L3D.Displayable.prototype);
L3D.Cube.prototype.constructor = L3D.Cube;

// class L3D.Plane extends L3D.Displayable
L3D.Plane = function(size1, size2, style) {
    L3D.Displayable.call(this);

    if (style === undefined)  style = {};

    this.geometry = new THREE.PlaneBufferGeometry(size1, size2);
    this.material = new THREE.MeshLambertMaterial(style);
    this.material.side = THREE.DoubleSide;
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.receiveShadow = true;
};
L3D.Plane.prototype = Object.create(L3D.Displayable.prototype);
L3D.Plane.prototype.constructor = L3D.Plane;

L3D.Plane.prototype.addToScene = function(scene) {
    scene.add(this.mesh);
};
