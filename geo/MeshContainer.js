var Log = require('../lib/NodeLog.js');

function clone(vec) {
    return {x : vec.x, y : vec.y, z : vec.z};
}

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
     * array of each part of the mesh
     * @type {geo.Mesh[]}
     */
    this.meshes = [];

    /**
     * array of the vertices of the meshes (all merged)
     * @type {geo.Vertex[]}
     */
    this.vertices = [];

    /**
     * array of the faces of the meshes (all merged)
     * @type {geo.Face[]}
     */
    this.faces = [];

    /**
     * array of the normals of the meshes (all merged)
     * @type {geo.Normal[]}
     */
    this.normals = [];

    /**
     * array of the texture coordinates (all merged)
     * @type {geo.TexCoord[]}
     */
    this.texCoords = [];

    /**
     * Number of elements to stream in the mesh
     * @type {Number}
     */
    this.numberOfFaces = 0;

    this.transfo = transfo;

    this.callback = callback;

    if (path !== undefined) {

        this.loadFromFile(path);

    }

};

/**
 * Loads a obj file
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

                // usemtl
                // If a current mesh exists, finish it

                // Create a new mesh
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
        done: false
    },
    '/static/data/mountain/coocoolmountain.obj': {
        done: false
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
        }
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
        }
    },

    '/static/data/sponza/sponza.obj': {
        done: false
    }

};

for (var i = 1; i < 26; i++) {

    availableMeshNames['/static/data/spheres/' + i + '.obj'] = false;

}

geo.availableMeshes = {};

var start = Date.now();

function pushMesh(name) {

    geo.availableMeshes[name] = new geo.MeshContainer(
        name.substring(1, name.length),
        availableMeshNames[name].transfo,
        function() {
            availableMeshNames[name].done = true;
            trySetLoaded();
        }
    );

}

for (var name in availableMeshNames) {

    pushMesh(name);

}
