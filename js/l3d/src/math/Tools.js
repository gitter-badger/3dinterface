/**
 * @namespace
 * @memberof L3D
 * @description Contains various functions for manipulating THREE.Vector3
 * Note that all these functions also work objects {x: x, y: y, z: z}, even if
 * they're not THREE.Vector3
 */
L3D.Tools = {};

/**
 * @memberof L3D.Tools
 * @description Computes the sum of two vectors
 * @param v1 {Vector} first vector of the sum
 * @param v2 {Vector} second vector of the sum
 * @returns {THREE.Vector3} v1 + v2
 */
L3D.Tools.sum = function(v1, v2) {
    return new THREE.Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
};

/**
 * @memberof L3D.Tools
 * @description Computes the difference between two vectors
 * @param v1 {Vector} first vector of the difference
 * @param v2 {Vector} second vector of the difference
 * @returns {THREE.Vector3} v1 - v2
 */
L3D.Tools.diff = function(v1, v2) {
    return new THREE.Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
};

/**
 * @memberof L3D.Tools
 * @description Computes the dot product of two vectors
 * @param v1 {Vector} first vector of the dot product
 * @param v2 {Vector} second vector of the dot product
 * @returns {THREE.Vector3} v1 * v2
 */
L3D.Tools.dot = function(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};

/**
 * @memberof L3D.Tools
 * @description Computes the cross product of two vectors
 * @param v1 {Vector} first vector of the cross product
 * @param v2 {Vector} second vector of the cross product
 * @returns {THREE.Vector3} v1 ^ v2
 */
L3D.Tools.cross = function(v1, v2) {
    return new THREE.Vector3(
         v1.y * v2.z - v1.z * v2.y,
         v1.z * v2.x - v1.x * v2.z,
         v1.x * v2.y - v1.y * v2.x
    );
};

/**
 * @memberof L3D.Tools
 * @description Computes the product of a vector and a number
 * @param v1 {Vector} vector of the product
 * @param lambda {Number} number of the product
 * @returns {THREE.Vector3} v1 * lambda
 */
L3D.Tools.mul = function(v1, lambda) {
    return new THREE.Vector3(v1.x * lambda, v1.y * lambda, v1.z * lambda);
};

/**
 * @memberof L3D.Tools
 * @description Computes the square norm of a vector
 * @param v {Vector} vector you want to compute the norm of
 * @returns {Number} ||v||²
 */
L3D.Tools.norm2 = function(v) {
    return v.x * v.x + v.y * v.y + v.z * v.z;
};

/**
 * @memberof L3D.Tools
 * @description Computes the norm of a vector
 * @param v {Vector} vector you want to compute the norm of
 * @returns {Number} ||v||
 */
L3D.Tools.norm = function(v) {
    return Math.sqrt(L3D.Tools.norm2(v));
};
