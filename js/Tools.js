var Tools = {version : "1.0" };

Tools.sum = function(v1, v2) {
    return new THREE.Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}

Tools.diff = function(v1, v2) {
    return new THREE.Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}

Tools.dot = function(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

Tools.cross = function(v1, v2) {
    return new THREE.Vector3(
         v1.y * v2.z - v1.z * v2.y,
         v1.z * v2.x - v1.x * v2.z,
         v1.x * v2.y - v1.y * v2.x
    );
}

Tools.mul = function(v1, lambda) {
    return new THREE.Vector3(v1.x * lambda, v1.y * lambda, v1.z * lambda);
}

Tools.equals = function(v1, v2) {
    return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
}

Tools.norm2 = function(v) {
    return v.x * v.x + v.y * v.y + v.z * v.z;
}

Tools.norm = function(v) {
    return Math.sqrt(Tools.norm2(v));
}
