// Initialization

// class camera extends THREE.PerspectiveCamera
var ReverseCamera = function(arg1, arg2, arg3, arg4, position, target) {
    ArrowCamera.apply(this, arguments);
}
ReverseCamera.prototype = Object.create(ArrowCamera.prototype);
ReverseCamera.prototype.constructor = ReverseCamera;

// Overload init
ReverseCamera.prototype.initExtremity = function() {
    var geometry = new THREE.Geometry();

    var direction = this.target.clone();
    direction.sub(this.position);
    direction.normalize();

    var left = Tools.cross(direction, this.up);
    var other = Tools.cross(direction, left);

    left.normalize();
    other.normalize();
    left = Tools.mul(left, 0.1);
    other  = Tools.mul(other, 0.1);

    var pyramidCenter = Tools.diff(this.position, Tools.mul(direction,0.25))
    geometry.vertices.push(
        Tools.sum( Tools.sum( this.position, left),  other),
        Tools.diff(Tools.sum( this.position, other), left),
        Tools.diff(Tools.diff(this.position, left),  other),
        Tools.sum( Tools.diff(this.position, other), left),

        Tools.sum( Tools.sum( this.position, left),  other),
        Tools.diff(Tools.sum( this.position, other), left),
        Tools.diff(Tools.diff(this.position, left),  other),
        Tools.sum( Tools.diff(this.position, other), left)
        // Tools.diff(this.position, direction)
    );

    var lambda = 0.6;
    for (var i = 0; i < 4; i++)
        geometry.vertices[i] = Tools.mul(Tools.diff(geometry.vertices[i], Tools.mul(pyramidCenter,lambda)), 1/(1-lambda));


    geometry.faces.push(new THREE.Face3(2,0,1), // new THREE.Face3(0,2,1),
                        new THREE.Face3(3,0,2),  // new THREE.Face3(0,3,2)

                        new THREE.Face3(1,0,4),
                        new THREE.Face3(1,4,5),

                        new THREE.Face3(2,1,5),
                        new THREE.Face3(2,5,6),

                        new THREE.Face3(7,2,6),
                        new THREE.Face3(7,3,2),

                        new THREE.Face3(3,7,4),
                        new THREE.Face3(3,4,0)

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
