// Initialization

// class camera extends THREE.PerspectiveCamera
var ArrowCamera = function(arg1, arg2, arg3, arg4, position, target) {
    THREE.PerspectiveCamera.apply(this, arguments);

    // Set Position
    if (position === undefined) {
        this.position = new THREE.Vector3(0,0,5);
    } else {
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }

    if (target === undefined)
        target = new THREE.Vector3(0,0,0);

    var direction = target.clone();
    direction.sub(this.position);
    direction.normalize();

    this.center = this.position.clone();
    this.center.sub(direction);

    this.target = this.position.clone();
    this.target.add(Tools.mul(direction,20));


    this.arrow = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({color: 0xff0000, side:THREE.BackSide}));

    this.object3D = new THREE.Object3D();
    this.object3D.add(this.initExtremity());
    this.object3D.add(this.arrow);

    this.fullArrow = false;
}
ArrowCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
ArrowCamera.prototype.constructor = ArrowCamera;

ArrowCamera.prototype.initExtremity = function() {
    var geometry = new THREE.Geometry();

    var direction = this.target.clone();
    direction.sub(this.position);
    direction.normalize();

    var left = Tools.cross(direction, this.up);
    var other = Tools.cross(direction, left);


    left.normalize();
    other.normalize();
    left = Tools.mul(left, 0.2);
    other  = Tools.mul(other, 0.2);

    geometry.vertices.push(Tools.sum( Tools.sum( this.position, left),  other),
                           Tools.diff(Tools.sum( this.position, other), left),
                           Tools.diff(Tools.diff(this.position, left),  other),
                           Tools.sum( Tools.diff(this.position, other), left),
                           Tools.sum(this.position, direction)
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
        color : 0xff0000,
        transparent : true,
        opacity : 0.5,
        side: THREE.FrontSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    return this.mesh;
}

// Update function
ArrowCamera.prototype.update = function(mainCamera) {
    // Compute distance between center of camera and position
    dist = Tools.norm2(Tools.diff(mainCamera.position, this.center));

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
}

ArrowCamera.prototype.regenerateArrow = function(mainCamera) {
    var vertices = new Array();
    var t = [0,1];
    var f0 = mainCamera.position.clone();
    f0.add(Tools.sum(Tools.mul(this.up,-1), Tools.diff(this.target, this.position).normalize()));
    var f = [Tools.sum(mainCamera.position, Tools.diff(this.target, this.position)).normalize(), this.position.clone()];

    var first = Tools.diff(mainCamera.target, mainCamera.position);
    first.normalize();

    var fp = [Tools.mul(first,40), Tools.diff(this.target, this.position)];
    fp[1].normalize();
    fp[1].multiplyScalar(4);
    var hermite = new Hermite.special.Polynom(f0, f[1], fp[1]);

    var up = this.up.clone();
    var point;
    var deriv;
    var limit = this.fullArrow ? 0.1 : 0.3;

    // for (var i = this.fullArrow ? 0 : 0.5; i <= 1.001; i += 0.05) {
    for (var i = 1; i > limit; i -= 0.025) {
        point = hermite.eval(i);
        deriv = hermite.prime(i);
        up.cross(deriv);
        up.cross(deriv);
        up.multiplyScalar(-1);
        up.normalize();

        var coeff = 0.1;
        var left = Tools.cross(up, deriv); left.normalize(); left.multiplyScalar(coeff);
        var other = Tools.cross(deriv, left);  other.normalize(); other.multiplyScalar(coeff);

        vertices.push(
            Tools.sum(Tools.sum(point, left), other),
            Tools.sum(Tools.diff(point, left), other),
            Tools.diff(point, Tools.sum(other,left)),
            Tools.sum(Tools.diff(point, other), left)
        );
    }

    var faces = new Array();

    for (var i = 0; i < vertices.length - 4; i+= 4) {
        faces.push(new THREE.Face3(i,i+1,i+5),new THREE.Face3(i,i+5,i+4),
                   new THREE.Face3(i+1,i+2,i+6),new THREE.Face3(i+1,i+6,i+5),
                   new THREE.Face3(i+2,i+3,i+7),new THREE.Face3(i+2,i+7,i+6),
                   new THREE.Face3(i,i+7,i+3), new THREE.Face3(i,i+4,i+7));
    }

    var len = vertices.length;
    faces.push(new THREE.Face3(len-4,len-3,len-2), new THREE.Face3(len-4,len-2,len-1));


    this.arrow.geometry.vertices = vertices;
    this.arrow.geometry.faces = faces;

    // this.arrow.geometry.mergeVertices();
    this.arrow.geometry.computeFaceNormals();
    // this.arrow.geometry.computeVertexNormals();
    this.arrow.geometry.computeBoundingSphere();

    // this.arrow.geometry.vertices[0] = new THREE.Vector3(); // mainCamera.position.clone();
    // this.arrow.geometry.vertices[1] = this.position.clone();

    this.arrow.geometry.dynamic = true;
    this.arrow.geometry.verticesNeedUpdate = true;
    this.arrow.geometry.elementsNeedUpdate = true;
    this.arrow.geometry.groupsNeedUpdate = true;
    this.arrow.geometry.normalsNeedUpdate = true;
    // this.arrow.geometry.facesNeedUpdate = true;

}

// Look function
ArrowCamera.prototype.look = function() {
    this.lookAt(this.target);
}

ArrowCamera.prototype.addToScene = function(scene) {
    scene.add(this);
    scene.add(this.object3D);
}

ArrowCamera.prototype.traverse = function(callback) {
    this.object3D.traverse(callback);
}

ArrowCamera.prototype.containsObject = function(object) {
    return object.parent === this.object3D;
}
