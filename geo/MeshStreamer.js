var fs = require('fs');
var mesh = require('./Mesh.js');

var geo = {};

function bisect(items, x, lo, hi) {
    var mid;
    if (typeof(lo) == 'undefined') lo = 0;
    if (typeof(hi) == 'undefined') hi = items.length;
    while (lo < hi) {
        mid = Math.floor((lo + hi) / 2);
        if (x < items[mid]) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

function insort(items, x) {
    items.splice(bisect(items, x), 0, x);
}

function partialSort(items, k, comparator) {
    var smallest = items.slice(0, k).sort(),
        max = smallest[k-1];

    for (var i = k, len = items.length; i < len; ++i) {
        var item = items[i];
        var cond = comparator === undefined ? item < max : comparator(item, max) < 0;
        if (cond) {
            insort(smallest, item);
            smallest.length = k;
            max = smallest[k-1];
        }
    }
    return smallest;
}

geo.MeshStreamer = function(path, callback) {
    // Different parts of a obj (a mesh per material)
    this.meshes = [];

    // In meshes, vertices and texture coords are shared
    this.vertices = [];
    this.faces = [];
    this.normals = [];
    this.texCoords = [];
    this.orderedFaces = [];

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

// Returns the function that compares two faces
geo.MeshStreamer.prototype.faceComparator = function(camera) {

    var self = this;

    var direction = {
        x: camera.target.x - camera.position.x,
        y: camera.target.y - camera.position.y,
        z: camera.target.z - camera.position.z
    };

    var norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);

    direction.x /= norm;
    direction.y /= norm;
    direction.z /= norm;

    return function(face1, face2) {

        var center1 = {
            x: (self.vertices[face1.a].x + self.vertices[face1.b].x + self.vertices[face1.b].x) / 3,
            y: (self.vertices[face1.a].y + self.vertices[face1.b].y + self.vertices[face1.b].y) / 3,
            z: (self.vertices[face1.a].z + self.vertices[face1.b].z + self.vertices[face1.b].z) / 3

        };

        var dir1 = {
            x: center1.x - camera.position.x,
            y: center1.y - camera.position.y,
            z: center1.z - camera.position.z
        };

        var norm1 = Math.sqrt(dir1.x * dir1.x + dir1.y * dir1.y + dir1.z + dir1.z);

        dir1.x /= norm1;
        dir1.y /= norm1;
        dir1.z /= norm1;

        var dot1 = direction.x * dir1.x + direction.y * dir1.y + direction.z * dir1.z;

        var center2 = {
            x: (self.vertices[face2.a].x + self.vertices[face2.b].x + self.vertices[face2.b].x) / 3,
            y: (self.vertices[face2.a].y + self.vertices[face2.b].y + self.vertices[face2.b].y) / 3,
            z: (self.vertices[face2.a].z + self.vertices[face2.b].z + self.vertices[face2.b].z) / 3
        }

        var dir2 = {
            x: center2.x - camera.position.x,
            y: center2.y - camera.position.y,
            z: center2.z - camera.position.z
        };

        var norm2 = Math.sqrt(dir2.x * dir2.x + dir2.y * dir2.y + dir2.z + dir2.z);

        dir2.x /= norm2;
        dir2.y /= norm2;
        dir2.z /= norm2;

        var dot2 = direction.x * dir2.x + direction.y * dir2.y + direction.z * dir2.z;

        // Decreasing order
        if (dot1 > dot2) {
            return -1;
        }
        if (dot1 < dot2) {
            return 1;
        }
        return 0;

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
                self.orderedFaces.push(faces[0]);

                if (faces.length === 2) {

                    faces[1].index = self.faces.length;
                    faces[1].meshIndex = self.meshes.length - 1;
                    self.faces.push(faces[1]);
                    self.orderedFaces.push(faces[1]);

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

    socket.on('materials', function() {

        var data = self.nextMaterials();

        socket.emit('elements', data);

    });

    socket.on('next', function(camera) {


        // Send next elements
        var next = self.nextElements(camera);

        socket.emit('elements', next.data);

        if (next.finished) {

            socket.disconnect();

        }

    });
}

geo.MeshStreamer.prototype.nextMaterials = function() {

    var data = [];

    for (var i = 0; i < this.meshes.length; i++) {

        var currentMesh = this.meshes[i];

        // Send usemtl
        data.push([
            'u',
            currentMesh.material,
            currentMesh.vertices.length,
            currentMesh.faces.length,
            this.texCoords.length > 0,
            this.normals.length > 0
        ]);

    }

    return data;

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

    // Sort faces
    this.orderedFaces.sort(this.faceComparator(camera));

    var mightBeCompletetlyFinished = true;

    for (var faceIndex = 0; faceIndex < this.orderedFaces.length; faceIndex++) {

        var currentFace = this.orderedFaces[faceIndex];
        var currentMesh = this.meshes[currentFace.meshIndex];

        if (currentFace.sent) {

            continue;

        } else {

            mightBeCompletetlyFinished = false;

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

    return {data: data, finished: mightBeCompletetlyFinished};

}

module.exports = geo;
