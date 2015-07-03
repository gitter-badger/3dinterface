var Log = require('../lib/NodeLog.js');

/**
 * Represents a mesh. All meshes are loaded once in geo.availableMesh to avoid
 * loading at each mesh request
 * @constructor
 * @memberOf geo
 */
geo.MeshContainer = function(path, callback) {

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
                    // if (currentMesh === undefined) {

                    //     // Chances are that we won't use any material in this case
                    //     currentMesh = new geo.Mesh();
                    //     self.meshes.push(currentMesh);

                    // }

                    var vertex = new geo.Vertex(line);
                    vertex.index = self.vertices.length;
                    self.vertices.push(vertex);

                }

            } else if (line[0] === 'f') {

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

        if (availableMeshNames[name] === false) {

            return;

        }

    }

    Log.ready("All meshes are ready");
}

var availableMeshNames = {
    '/static/data/castle/princess peaches castle (outside).obj':false,
    '/static/data/mountain/coocoolmountain.obj':false,
    '/static/data/whomp/Whomps Fortress.obj':false,
    '/static/data/bobomb/bobomb battlefeild.obj':false,
    '/static/data/sponza/sponza.obj':false
};

for (var i = 1; i < 26; i++) {

    availableMeshNames['/static/data/spheres/' + i + '.obj'] = false;

}

geo.availableMeshes = {};

for (var name in availableMeshNames) {

    (function(name) {
        geo.availableMeshes[name] = new geo.MeshContainer(name.substring(1, name.length), function() {
            availableMeshNames[name] = true;
            trySetLoaded();
        });
    })(name);

}
