var Log = require('../lib/NodeLog.js');
var L3D = require('../../static/js/l3d.min.js');
var THREE = require('three');

/**
 * Clones a vector
 * @private
 * @param {Object} vec an object with attributes x, y, and z
 * @return {Object} a new object with the same x, y, and z attributes
 */
function clone(vec) {
    return {x : vec.x, y : vec.y, z : vec.z};
}

/**
 * Rotates a vector, three.js style
 * @private
 * @param {Object} vec1 an object with attributes x, y, and z
 * @param {Number} x three.js's rotateX value
 * @param {Number} y three.js's rotateY value
 * @param {Number} z three.js's rotateZ value
 * @return {Object} a new vector corresponding to the rotated vector
 */
function rotation(vec1, x, y, z) {

    var cos = Math.cos(z);
    var sin = Math.sin(z);

    var newVec = {x:0, y:0, z:0};
    oldVec = clone(vec1);

    newVec.x = cos * oldVec.x - sin * oldVec.y;
    newVec.y = sin * oldVec.x + cos * oldVec.y;
    newVec.z = oldVec.z;

    oldVec = clone(newVec);

    cos = Math.cos(y);
    sin = Math.sin(y);

    newVec.x = cos * oldVec.x + sin * oldVec.z;
    newVec.y = oldVec.y;
    newVec.z = - sin * oldVec.x + cos * oldVec.z;

    cos = Math.cos(x);
    sin = Math.sin(x);

    oldVec = clone(newVec);

    newVec.x = oldVec.x;
    newVec.y = oldVec.y * cos - oldVec.z * sin;
    newVec.z = oldVec.y * sin + oldVec.z * cos;

    return clone(newVec);
}

/**
 * Applies a transformation to a vector
 * @param {Object} vector an object with attributes x, y, and z
 * @param {Object} transfo an object with attributes
 *   <ul>
 *      <li><code>translation</code> : an object with attributes x, y, and z representing the translation</li>
 *      <li><code>rotation</code> : an object with attributes x, y, and z representing the rotation</li>
 *      <li><code>scale</code> : a number representing the scaling </li>
 *   </ul>
 * @see {@link rotation}
 * @return {Object} a new object with attributes x, y and z corresponding to the transformation applied to <code>vector</code>
 */
function applyTransformation(vector, transfo) {

    var ret = rotation(vector, transfo.rotation.x, transfo.rotation.y, transfo.rotation.z);
    var scale = transfo.scale || 1;

    return {
        x: (ret.x + transfo.translation.x) * scale,
        y: (ret.y + transfo.translation.y) * scale,
        z: (ret.z + transfo.translation.z) * scale
    };
}



/**
 * Represents a mesh. All meshes are loaded once in geo.availableMesh to avoid
 * loading at each mesh request
 * @constructor
 * @param {String} path path to the .obj file
 * @param {Object} transfo a transformation object to apply during the loading
 * @param {function} callback callback to call on the mesh
 * @memberOf geo
 */
geo.MeshContainer = function(path, transfo, callback) {

    if (callback === undefined && typeof transfo === 'function') {
        callback = transfo;
        transfo = {translation: {x:0,y:0,z:0}, rotation: {x:0,y:0,z:0}};
    }

    if (transfo === undefined) {
        transfo = {translation: {x:0,y:0,z:0}, rotation: {x:0,y:0,z:0}};
    }

    /**
     * Array of each part of the mesh
     * @type {geo.Mesh[]}
     */
    this.meshes = [];

    /**
     * Array of the vertices of the meshes (all merged)
     * @type {geo.Vertex[]}
     */
    this.vertices = [];

    /**
     * Array of the faces of the meshes (all merged)
     * @type {geo.Face[]}
     */
    this.faces = [];

    /**
     * Array of the normals of the meshes (all merged)
     * @type {geo.Normal[]}
     */
    this.normals = [];

    /**
     * Array of the texture coordinates (all merged)
     * @type {geo.TexCoord[]}
     */
    this.texCoords = [];

    /**
     * Number of elements to stream in the mesh
     * @type {Number}
     */
    this.numberOfFaces = 0;

    /**
     * Transformation that should be applied to the mesh when loading it
     * @type {Object}
     * @see {@link applyTransformation}
     */
    this.transfo = transfo;

    /**
     * Function to call on the mesh once it is loaded
     * @type {function}
     */
    this.callback = callback;

    if (path !== undefined) {

        this.loadFromFile('../' + path);

    }

};

/**
 * Loads a obj file and apply the transformation
 * @param {string} path the path to the file
 */
geo.MeshContainer.prototype.loadFromFile = function(path) {
    var self = this;

    fs.readFile(path, {encoding: 'utf-8'}, function(err, data) {

        var currentMesh;

        // Get lines from file
        var lines = data.toString('utf-8').split("\n");

        // For each line
        for (var i = 0; i < lines.length; i++) {

            var line = lines[i];

            if (line[0] === 'v') {

                if (line[1] === 't') {

                    // Texture coord
                    var texCoord = new geo.TexCoord(line);
                    texCoord.index = self.texCoords.length;
                    self.texCoords.push(texCoord);

                } else if (line[1] === 'n') {

                    var normal = new geo.Normal(line);
                    normal.index = self.normals.length;
                    self.normals.push(normal);

                } else {

                    // Just a simple vertex
                    var vertex = new geo.Vertex(line);
                    var vertexTransformed = applyTransformation(vertex, self.transfo);

                    vertex.x = vertexTransformed.x;
                    vertex.y = vertexTransformed.y;
                    vertex.z = vertexTransformed.z;

                    vertex.index = self.vertices.length;
                    self.vertices.push(vertex);

                }

            } else if (line[0] === 'f') {

                self.numberOfFaces++;

                // Create mesh if it doesn't exist
                if (currentMesh === undefined) {
                    currentMesh = new geo.Mesh();
                    self.meshes.push(currentMesh);
                }

                // Create faces (two if Face4)
                var faces = currentMesh.addFaces(line);

                faces[0].index = self.faces.length;
                faces[0].meshIndex = self.meshes.length - 1;
                self.faces.push(faces[0]);

                if (faces.length === 2) {

                    self.numberOfFaces++;
                    faces[1].index = self.faces.length;
                    faces[1].meshIndex = self.meshes.length - 1;
                    self.faces.push(faces[1]);

                }

            } else if (line[0] === 'u') {

                // usemtl : create a new mesh
                currentMesh = new geo.Mesh();
                self.meshes.push(currentMesh);
                currentMesh.material = (new geo.Material(line)).name;
                // console.log(currentMesh.material);

            }

        }


        if (typeof self.callback === 'function') {

            self.callback();

        }

    });

};

function trySetLoaded() {
    for (var name in availableMeshNames) {

        if (availableMeshNames[name].done === false) {

            return;

        }

    }

    Log.ready("Meshes loaded in " + (Date.now() - start) + 'ms');
}

var availableMeshNames = {
    '/static/data/castle/princess peaches castle (outside).obj': {
        done: false,
        recommendations : L3D.createPeachRecommendations(1134, 768)

    },
    '/static/data/mountain/coocoolmountain.obj': {
        done: false,
        recommendations : L3D.createMountainRecommendations(1134, 768)
    },
    '/static/data/mountain/coocoolmountain_sub.obj': {
        done: false,
        recommendations : L3D.createMountainRecommendations(1134, 768)
    },
    '/static/data/whomp/Whomps Fortress.obj': {
        done: false,
        transfo: {
            rotation: {
                x: -Math.PI / 2,
                y: 0,
                z: Math.PI / 2
            },
            translation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: 0.1
        },
        recommendations : L3D.createWhompRecommendations(1134, 768)
    },
    '/static/data/whomp/Whomps Fortress_sub.obj': {
        done: false,
        transfo: {
            rotation: {
                x: -Math.PI / 2,
                y: 0,
                z: Math.PI / 2
            },
            translation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: 0.1
        },
        recommendations : L3D.createWhompRecommendations(1134, 768)
    },
    '/static/data/bobomb/bobomb battlefeild.obj': {
        done: false,
        transfo: {
            rotation: {
                x: 0,
                y: Math.PI - 0.27,
                z: 0
            },
            translation: {
                x: 0,
                y: 0,
                z: 0
            }
        },
        recommendations : L3D.createBobombRecommendations(1134, 768)
    },

    '/static/data/bobomb/bobomb battlefeild_sub.obj': {
        done: false,
        transfo: {
            rotation: {
                x: 0,
                y: Math.PI - 0.27,
                z: 0
            },
            translation: {
                x: 0,
                y: 0,
                z: 0
            }
        },
        recommendations : L3D.createBobombRecommendations(1134, 768)
    },

    '/static/data/sponza/sponza.obj': {
        done: false,
        transfo : {
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            translation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: 0.02
        },
        recommendations : L3D.createSponzaRecommendations(1134,768)
    }

};

for (var i = 1; i < 26; i++) {

    availableMeshNames['/static/data/spheres/' + i + '.obj'] = { done: false};

}

geo.availableMeshes = {};

var start = Date.now();

function pushMesh(name) {

    geo.availableMeshes[name] = new geo.MeshContainer(
        name.substring(1, name.length),
        availableMeshNames[name].transfo,
        function() {
            geo.availableMeshes[name].recommendations = [];

            if (availableMeshNames[name].recommendations !== undefined) {

                for (var i = 0; i < availableMeshNames[name].recommendations.length; i++) {

                    var reco = availableMeshNames[name].recommendations[i].camera;

                    reco.aspect = 1134 / 768;

                    reco.lookAt(reco.target);

                    reco.updateMatrix();
                    reco.updateProjectionMatrix();
                    reco.updateMatrixWorld();

                    reco.matrixWorldInverse.getInverse( reco.matrixWorld );

                    var frustum = new THREE.Frustum();
                    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(reco.projectionMatrix, reco.matrixWorldInverse));

                    geo.availableMeshes[name].recommendations.push({
                        position: reco.position,
                        target: reco.target,
                        planes: frustum.planes
                    });

                }
            }

            availableMeshNames[name].done = true;
            trySetLoaded();
        }
    );

}

for (var name in availableMeshNames) {

    pushMesh(name);

}
