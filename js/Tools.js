var Tools = {version : "1.0" };

Tools.sum = function(v1, v2) {
    var ret = v1.clone();
    ret.add(v2);
    return ret;
}

Tools.diff = function(v1, v2) {
    var ret = v1.clone();
    ret.sub(v2);
    return ret;
}

Tools.dot = function(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

Tools.cross = function(v1, v2) {
    var ret = v1.clone();
    ret.cross(v2);
    return ret;
}

Tools.mul = function(v1, lambda) {
    var ret = v1.clone();
    ret.multiplyScalar(lambda);
    return ret;
}

Tools.equals = function(v1, v2) {
    return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
}
