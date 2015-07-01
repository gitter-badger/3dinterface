L3D.Tools = {};

L3D.Tools.sum = function(v1, v2) {
    return new THREE.Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
};

L3D.Tools.diff = function(v1, v2) {
    return new THREE.Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
};

L3D.Tools.dot = function(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};

L3D.Tools.cross = function(v1, v2) {
    return new THREE.Vector3(
         v1.y * v2.z - v1.z * v2.y,
         v1.z * v2.x - v1.x * v2.z,
         v1.x * v2.y - v1.y * v2.x
    );
};

L3D.Tools.mul = function(v1, lambda) {
    return new THREE.Vector3(v1.x * lambda, v1.y * lambda, v1.z * lambda);
};

L3D.Tools.equals = function(v1, v2) {
    return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
};

L3D.Tools.norm2 = function(v) {
    return v.x * v.x + v.y * v.y + v.z * v.z;
};

L3D.Tools.norm = function(v) {
    return Math.sqrt(L3D.Tools.norm2(v));
};
