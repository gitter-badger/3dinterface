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

        var oldTime = Date.now();

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
                currentMesh = new mesh.Mesh();
                self.meshes.push(currentMesh);
                currentMesh.material = (new mesh.Material(line)).name;
                // console.log(currentMesh.material);

            }

        }

        if (typeof callback === 'function') {
            callback();
        }

        console.log(Date.now() - oldTime);

    });
}

geo.MeshStreamer.prototype.start = function(socket) {

    this.meshIndex = 0;
    this.socket = socket;

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

    socket.on('next', function(camera) {


        // Send next elements
        var next = self.nextElements(camera);

        // console.log(self.meshIndex);
        // console.log(data);

        // Emit self.chunk faces (and the corresponding vertices if not emitted)
        socket.emit('elements', next.data);

        if (next.finished) {

            socket.disconnect();

        }

    });
}

geo.MeshStreamer.prototype.nextElements = function(_camera) {

    // Prepare camera (and scale to model)
    var camera = null;

    if (_camera !== null) {

        var camera = {
            position: {
                x: _camera[0],
                y: _camera[1],
                z: _camera[2]
            },
            target: {
                x: _camera[3],
                y: _camera[4],
                z: _camera[5]
            }
        }

        // Compute camera direction
        var direction = {
            x: camera.target.x - camera.position.x,
            y: camera.target.y - camera.position.y,
            z: camera.target.z - camera.position.z
        }

    }

    var sent = 0;
    var data = [];


    var mightBeCompletetlyFinished = true;

    for (var meshIndex = 0; meshIndex < this.meshes.length; meshIndex++) {

        var currentMesh = this.meshes[meshIndex];

        if (currentMesh.isFinished()) {

            continue;

        } else {

            mightBeCompletetlyFinished = false;

        }

        for (var faceIndex = 0; faceIndex < currentMesh.faces.length; faceIndex++) {

            var currentFace = currentMesh.faces[faceIndex];

            if (currentFace.sent) {

                continue;

            }

            if (!currentMesh.started) {

                // Send usemtl
                data.push([
                    'u',
                    currentMesh.material,
                    currentMesh.vertices.length,
                    currentMesh.faces.length,
                    this.texCoords.length > 0,
                    this.normals.length > 0
                ]);
                sent++;
                currentMesh.started = true;

            }

            var vertex1 = this.vertices[currentFace.a];
            var vertex2 = this.vertices[currentFace.b];
            var vertex3 = this.vertices[currentFace.c];

            if (camera !== null) {

                var v1 = {
                    x: vertex1.x - camera.position.x,
                    y: vertex1.y - camera.position.y,
                    z: vertex1.z - camera.position.z
                };

                var v2 = {
                    x: vertex2.x - camera.position.x,
                    y: vertex2.y - camera.position.y,
                    z: vertex2.z - camera.position.z
                };

                var v3 = {
                    x: vertex3.x - camera.position.x,
                    y: vertex3.y - camera.position.y,
                    z: vertex3.z - camera.position.z
                };

                if (
                    direction.x * v1.x + direction.y * v1.y + direction.z * v1.z < 0 &&
                    direction.x * v2.x + direction.y * v2.y + direction.z * v2.z < 0 &&
                direction.x * v3.x + direction.y * v3.y + direction.z * v3.z < 0
                ) {

                    continue;

                }

            }

            if (!vertex1.sent) {

                data.push(vertex1.toList());
                vertex1.sent = true;
                sent++;

            }

            if (!vertex2.sent) {

                data.push(vertex2.toList());
                vertex2.sent = true;
                sent++;

            }

            if (!vertex3.sent) {

                data.push(vertex3.toList());
                vertex3.sent = true;
                sent++;

            }

            var normal1 = this.normals[currentFace.aNormal];
            var normal2 = this.normals[currentFace.bNormal];
            var normal3 = this.normals[currentFace.cNormal];

            if (normal1 !== undefined && !normal1.sent) {

                data.push(normal1.toList());
                normal1.sent = true;
                sent++;

            }

            if (normal2 !== undefined && !normal2.sent) {

                data.push(normal2.toList());
                normal2.sent = true;
                sent++;

            }

            if (normal3 !== undefined && !normal3.sent) {

                data.push(normal3.toList());
                normal3.sent = true;
                sent++;

            }

            var tex1 = this.texCoords[currentFace.aTexture];
            var tex2 = this.texCoords[currentFace.bTexture];
            var tex3 = this.texCoords[currentFace.cTexture];

            if (tex1 !== undefined && !tex1.sent) {

                data.push(tex1.toList());
                tex1.sent = true;
                sent++;

            }

            if (tex2 !== undefined && !tex2.sent) {

                data.push(tex2.toList());
                tex2.sent = true;
                sent++;

            }

            if (tex3 !== undefined && !tex3.sent) {

                data.push(tex3.toList());
                tex3.sent = true;
                sent++;

            }

            data.push(currentFace.toList());
            currentFace.sent = true;
            currentMesh.faceIndex++;

            sent++;

            if (sent > 500) {

                return {data: data, finished: false};

            }
        }

    }

    return {data: data, finished: mightBeCompletetlyFinished};

}

module.exports = geo;
