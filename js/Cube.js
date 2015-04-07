var Displayable = function() {
    // Nothing to do here
}

Displayable.prototype.addToScene = function(scene) {
    scene.add(this.mesh);
}

Displayable.prototype.translate = function(x,y,z) {
    this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(x,y,z));
}

// class Cube extends Displayable
var Cube = function(size, style) {
    // Super constructor call
    Displayable.call(this);

    if (size  === undefined) size = 100;
    if (style === undefined) style = {};

    this.geometry = new THREE.BoxGeometry(size, size, size);
    // this.geometry.computeVertexNormals();

    this.material = new THREE.MeshLambertMaterial(style);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = false;
}
Cube.prototype = Object.create(Displayable.prototype);
Cube.prototype.constructor = Cube;

// class Plane extends Displayable
var Plane = function(size1, size2, style) {
    Displayable.call(this);

    if (style === undefined)  style = {};

    this.geometry = new THREE.PlaneBufferGeometry(size1, size2);
    this.material = new THREE.MeshLambertMaterial(style);
    this.material.side = THREE.FrontSide;

    this.materialBack = new THREE.MeshLambertMaterial(style);
    this.materialBack.side = THREE.BackSide;

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.meshBack = new THREE.Mesh(this.geometry, this.materialBack);

    this.mesh.receiveShadow = true;
}
Plane.prototype = Object.create(Displayable.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.addToScene = function(scene) {
    scene.add(this.mesh);
    scene.add(this.meshBack);
}
