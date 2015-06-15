var fs = require('fs');
var mesh = require('./Mesh.js');

var geo = {};

geo.MeshStreamer = function(path, callback) {
    // Different parts of a obj (a mesh per material)
    this.meshes = [];

    // In meshes, vertices and texture coords are shared
    this.vertices = [];
    this.faces = [];
    this.texCoords = [];

    // Chunk size
    this.chunk = 1000;

    if (path !== undefined) {
        var self = this;
        this.loadFromFile(path, function() {

            if (typeof callback === 'function')
                callback();

        });
    }
}

geo.MeshStreamer.prototype.loadFromFile = function(path, callback) {
    var self = this;
    fs.readFile(path, function(err, data) {

        var currentMesh;

        // Get lines from file
        var lines = data.toString('utf-8').split("\n");

        // For each line
        for (var i = 0; i < lines.length; i++) {

            var line = lines[i];

            if (line[0] === 'v') {

                if (line[1] === 't') {

                    // Texture coord
                    self.texCoords.push(new mesh.TexCoord(line));

                } else if (line[1] === 'n') {

                    // Ignore normals

                } else {

                    // Just a simple vertex
                    if (currentMesh === undefined) {
                        // Chances are that we won't use any material in this case
                        currentMesh = new mesh.Mesh();
                        self.meshes.push(currentMesh);
                    }
                    var vertex = currentMesh.addVertex(line);
                    vertex.index = self.vertices.length;
                    self.vertices.push(vertex);

                }

            } else if (line[0] === 'f') {

                // Create faces (two if Face4)
                var faces = currentMesh.addFaces(line);

                faces[0].index = self.faces.length;
                self.faces.push(faces[0]);
                if (faces.length === 2) {
                    faces[1].index = self.faces.length;
                    self.faces.push(faces[1]);
                }

            } else if (line[0] === 'u') {

                // usemtl

                // Create a new mesh
                currentMesh = new mesh.Mesh();
                self.meshes.push(currentMesh);
                currentMesh.material = mesh.Material(line);
                self.orderedElements.push(new mesh.Usemtl(line));

            }

        }

        if (typeof callback === 'function') {
            callback();
        }
    });
}

geo.MeshStreamer.prototype.start = function(socket) {

    this.meshIndex = -1;

    var self = this;

    socket.on('request', function(path) {
        console.log('Asking for ' + path);

        var regex = /.*\.\..*/;

        if (regex.test(path)) {
            socket.emit('refused');
            socket.disconnect();
            return;
        }

        self.loadFromFile(path, function() {
            socket.emit('ok');
        });

    });

    socket.on('next', function() {

        // Send next elements
        var currentMesh = self.meshes[self.meshIndex];

        if (currentMesh === undefined || currentMesh.isFinished()) {
            currentMesh = self.meshes[++self.meshIndex];

            if (currentMesh === undefined) {
                socket.emit('finished');
                socket.disconnect();
                return;
            }

            socket.emit(
                'usemtl',
                currentMesh.material,
                currentMesh.vertices.length,
                currentMesh.faces.length,
                currentMesh.texCoords.length
            );

        } else {

            var data = [];

            for (var limit = Math.min(currentMesh.faceIndex + self.chunk, currentMesh.faces.length);
                 currentMesh.faceIndex < limit;
                 currentMesh.faceIndex++)
            {

                var currentFace = currentMesh.faces[currentMesh.faceIndex];
                var vertex1 = self.vertices[currentFace.a];
                var vertex2 = self.vertices[currentFace.b];
                var vertex3 = self.vertices[currentFace.c];

                if (!vertex1.sent) { data.push(vertex1.toList()); vertex1.sent = true;}
                if (!vertex2.sent) { data.push(vertex2.toList()); vertex2.sent = true;}
                if (!vertex3.sent) { data.push(vertex3.toList()); vertex3.sent = true;}

                data.push(currentFace.toList()); currentFace.sent = true;
            }

            // Emit self.chunk faces (and the corresponding vertices if not emitted)
            socket.emit('elements', data);

        }
    });
}

module.exports = geo;
