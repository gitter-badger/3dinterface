var fs = require('fs');
var mesh = require('./Mesh.js');

var geo = {};

geo.MeshStreamer = function(path, callback) {
    // Different parts of a obj (a mesh per material)
    this.meshes = [];

    // In meshes, vertices and texture coords are shared
    this.vertices = [];
    this.faces = [];
    this.normals = [];
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
                    var texCoord = new mesh.TexCoord(line);
                    texCoord.index = self.texCoords.length;
                    self.texCoords.push(texCoord);

                } else if (line[1] === 'n') {

                    var normal = new mesh.Normal(line);
                    normal.index = self.normals.length;
                    self.normals.push(normal);

                } else {

                    // Just a simple vertex
                    // if (currentMesh === undefined) {

                    //     // Chances are that we won't use any material in this case
                    //     currentMesh = new mesh.Mesh();
                    //     self.meshes.push(currentMesh);

                    // }

                    var vertex = new mesh.Vertex(line);
                    vertex.index = self.vertices.length;
                    self.vertices.push(vertex);

                }

            } else if (line[0] === 'f') {

                // Create mesh if it doesn't exist
                if (currentMesh === undefined) {
                    currentMesh = new mesh.Mesh();
                    self.meshes.push(currentMesh);
                }

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
                // If a current mesh exists, finish it

                // Create a new mesh
                currentMesh = new mesh.Mesh();
                self.meshes.push(currentMesh);
                currentMesh.material = (new mesh.Material(line)).name;
                // console.log(currentMesh.material);

            }

        }

        if (typeof callback === 'function') {
            callback();
        }
    });
}

geo.MeshStreamer.prototype.start = function(socket) {

    this.meshIndex = 0;

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
        var currentFace;

        var data = [];

        var sent = 0;

        while (sent < 500) {

            if (currentMesh.faceIndex === -1) {

                // Must give usemtl
                data.push(['u', currentMesh.material, currentMesh.vertices.length, currentMesh.faces.length, self.texCoords.length > 0, self.normals.length > 0]);
                sent++;
                currentFace = currentMesh.faces[++currentMesh.faceIndex];

            } else if (currentMesh.isFinished()) {

                // Must switch to next mesh
                currentMesh = self.meshes[++self.meshIndex];

                // If not other mesh, we finished
                if (currentMesh === undefined) {

                    socket.emit('elements', data);
                    socket.disconnect();
                    return;

                }

                data.push(['u', currentMesh.material, currentMesh.vertices.length, currentMesh.faces.length, self.texCoords.length > 0, self.normals.length > 0]);
                sent++;
                continue;

            } else {

                currentFace = currentMesh.faces[++currentMesh.faceIndex];

                if (currentFace === undefined) {

                    continue;

                }

            }

            var vertex1 = self.vertices[currentFace.a];
            var vertex2 = self.vertices[currentFace.b];
            var vertex3 = self.vertices[currentFace.c];

            if (!vertex1.sent) { data.push(vertex1.toList()); vertex1.sent = true; sent++;}
            if (!vertex2.sent) { data.push(vertex2.toList()); vertex2.sent = true; sent++;}
            if (!vertex3.sent) { data.push(vertex3.toList()); vertex3.sent = true; sent++;}

            var normal1 = self.normals[currentFace.aNormal];
            var normal2 = self.normals[currentFace.bNormal];
            var normal3 = self.normals[currentFace.cNormal];

            if (normal1 !== undefined && !normal1.sent) { data.push(normal1.toList()); normal1.sent = true; sent++;}
            if (normal2 !== undefined && !normal2.sent) { data.push(normal2.toList()); normal2.sent = true; sent++;}
            if (normal3 !== undefined && !normal3.sent) { data.push(normal3.toList()); normal3.sent = true; sent++;}

            var tex1 = self.texCoords[currentFace.aTexture];
            var tex2 = self.texCoords[currentFace.bTexture];
            var tex3 = self.texCoords[currentFace.cTexture];

            if (tex1 !== undefined && !tex1.sent) { data.push(tex1.toList()); tex1.sent = true; sent++;}
            if (tex2 !== undefined && !tex2.sent) { data.push(tex2.toList()); tex2.sent = true; sent++;}
            if (tex3 !== undefined && !tex3.sent) { data.push(tex3.toList()); tex3.sent = true; sent++;}

            currentFace.index = currentMesh.faceIndex;

            data.push(currentFace.toList()); currentFace.sent = true;
            sent++;

        }

        // Emit self.chunk faces (and the corresponding vertices if not emitted)
        socket.emit('elements', data);

    });
}

module.exports = geo;
