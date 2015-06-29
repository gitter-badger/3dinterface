/**
 * @private
 */
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

/**
 * @private
 */
function insort(items, x) {
    items.splice(bisect(items, x), 0, x);
}

/**
 * @private
 */
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

/**
 * A class that streams easily a mesh via socket.io
 * @memberOf geo
 * @constructor
 * @param {string} path to the mesh
 */
geo.MeshStreamer = function(path) {

    /**
     * array of array telling if the jth face of the ith mesh has already been sent
     *
     * For each mesh, there is an object containing
     * <ul>
     *   <li>`counter` : the number of faces currently sent</li>
     *   <li>`array` : an array boolean telling if the ith face has already been sent</li>
     * </ul>
     * @type {Object[]}
     */
    this.meshFaces = [];

    /**
     * array of booleans telling if the ith vertex has already been sent
     * @type {Boolean[]}
     */
    this.vertices = [];

    /**
     * array of booleans telling if the ith face has already been sent
     * @type {Boolean[]}
     */
    this.faces = [];

    /**
     * array of booleans telling if the ith normal has already been sent
     * @type {Boolean[]}
     */
    this.normals = [];

    /**
     * array of booleans telling if the ith texCoord has already been sent
     * @type {Boolean[]}
     */
    this.texCoords = [];

    /**
     * Number of element to send by packet
     * @type {Number}
     */
    this.chunk = 1000;

    if (path !== undefined) {

        this.mesh = geo.availableMeshes[path];

    }

}

/**
 * Compute a function that can compare two faces
 * @param {Camera} camera a camera seeing or not face
 * @returns the function that compares two faces : the higher face is the most interesting for the camera
 */
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

/**
 * Initialize the socket.io callback
 * @param {socket} socket the socket to initialize
 */
geo.MeshStreamer.prototype.start = function(socket) {

    this.meshIndex = 0;
    this.socket = socket;

    var self = this;

    socket.on('request', function(path) {

        self.mesh = geo.availableMeshes[path];

        self.meshFaces = new Array(self.mesh.meshes.length);

        for (var i = 0; i < self.meshFaces.length; i++) {

            self.meshFaces[i] = {
                counter: 0,
                array: new Array(self.mesh.meshes[i].faces.length)
            };

        }

        var regex = /.*\.\..*/;
        var filePath = path.substring(1, path.length);

        if (regex.test(filePath)) {
            socket.emit('refused');
            socket.disconnect();
            return;
        }

        socket.emit('ok');

    });

    socket.on('materials', function() {

        var data = self.nextMaterials();

        socket.emit('elements', data);

    });

    socket.on('next', function(camera) {


        // Send next elements
        var next = self.nextElements(camera);

        if (next.data.length === 0) {

            // If nothing, just serve stuff
            var tmp = self.nextElements(camera, true);
            next.data = tmp.data;

        }

        socket.emit('elements', next.data);

        if (next.finished) {

            socket.disconnect();

        }

    });
}

/**
 * Prepare the array of materials
 * @return array the array to send with all materials of the current mesh
 */
geo.MeshStreamer.prototype.nextMaterials = function() {

    var data = [];

    for (var i = 0; i < this.mesh.meshes.length; i++) {

        var currentMesh = this.mesh.meshes[i];

        // Send usemtl
        data.push([
            'u',
            currentMesh.material,
            currentMesh.vertices.length,
            currentMesh.faces.length,
            this.mesh.texCoords.length > 0,
            this.mesh.normals.length > 0
        ]);

    }

    return data;

}

/**
 * Prepare the next elements
 * @param {camera} _camera a camera that can be usefull to do smart streaming (stream
 * only interesting parts according to the camera
 * @returns {array} an array of elements ready to send
 */
geo.MeshStreamer.prototype.nextElements = function(_camera, force) {

    if (force === undefined) {

        force = false;

    }

    // Prepare camera (and scale to model)
    var camera = null;
    var planes = [];
    var direction;

    if (_camera !== null) {

        camera = {
            position: {
                x: _camera[0][0],
                y: _camera[0][1],
                z: _camera[0][2]
            },
            target: {
                x: _camera[1][0],
                y: _camera[1][1],
                z: _camera[1][2]
            }
        }

        for (var i = 2; i < _camera.length; i++) {

            planes.push({
                normal: {
                    x: _camera[i][0],
                    y: _camera[i][1],
                    z: _camera[i][2]
                },
                constant: _camera[i][3]
            });

        }

        // Compute camera direction
        direction = {
            x: camera.target.x - camera.position.x,
            y: camera.target.y - camera.position.y,
            z: camera.target.z - camera.position.z
        }

    }

    var sent = 0;
    var data = [];

    // Sort faces
    var mightBeCompletetlyFinished = true;

    for (var meshIndex = 0; meshIndex < this.mesh.meshes.length; meshIndex++) {

        var currentMesh = this.mesh.meshes[meshIndex];

        if (this.isFinished(meshIndex)) {

            continue;

        }  else {

            mightBeCompletetlyFinished = false;

        }

        for (var faceIndex = 0; faceIndex < currentMesh.faces.length; faceIndex++) {

            var currentFace = currentMesh.faces[faceIndex];

            if (this.meshFaces[meshIndex].array[faceIndex] === true) {

                continue;

            }

            var vertex1 = this.mesh.vertices[currentFace.a];
            var vertex2 = this.mesh.vertices[currentFace.b];
            var vertex3 = this.mesh.vertices[currentFace.c];

            // if (camera !== null) {

            //     var v1 = {
            //         x: vertex1.x - camera.position.x,
            //         y: vertex1.y - camera.position.y,
            //         z: vertex1.z - camera.position.z
            //     };

            //     var v2 = {
            //         x: vertex2.x - camera.position.x,
            //         y: vertex2.y - camera.position.y,
            //         z: vertex2.z - camera.position.z
            //     };

            //     var v3 = {
            //         x: vertex3.x - camera.position.x,
            //         y: vertex3.y - camera.position.y,
            //         z: vertex3.z - camera.position.z
            //     };

            //     if (
            //         direction.x * v1.x + direction.y * v1.y + direction.z * v1.z < 0 &&
            //         direction.x * v2.x + direction.y * v2.y + direction.z * v2.z < 0 &&
            //         direction.x * v3.x + direction.y * v3.y + direction.z * v3.z < 0
            //     ) {

            //         continue;

            //     }

            // }

            if (!force) {

                var exitToContinue = false;
                threeVertices = [vertex1, vertex2, vertex3];

                for (var i = 0; i < threeVertices.length; i++) {

                    var vertex = threeVertices[i];

                    for (var j = 0; j < planes.length;  j++) {

                        var plane = planes[j];

                        distance =
                            plane.normal.x * vertex.x +
                            plane.normal.y * vertex.y +
                            plane.normal.z * vertex.z +
                            plane.constant;

                        if (distance < 0)
                            {
                                exitToContinue = true;
                                break;
                            }

                    }

                    if (exitToContinue)
                        break;

                }

                if (exitToContinue)
                    continue;

            }

            if (!this.vertices[currentFace.a]) {

                data.push(vertex1.toList());
                this.vertices[currentFace.a] = true;
                sent++;

            }

            if (!this.vertices[currentFace.b]) {

                data.push(vertex2.toList());
                this.vertices[currentFace.b] = true;
                sent++;

            }

            if (!this.vertices[currentFace.c]) {

                data.push(vertex3.toList());
                this.vertices[currentFace.c] = true;
                sent++;

            }

            var normal1 = this.mesh.normals[currentFace.aNormal];
            var normal2 = this.mesh.normals[currentFace.bNormal];
            var normal3 = this.mesh.normals[currentFace.cNormal];

            if (normal1 !== undefined && !this.normals[currentFace.aNormal]) {

                data.push(normal1.toList());
                this.normals[currentFace.aNormal] = true;
                sent++;

            }

            if (normal2 !== undefined && !this.normals[currentFace.bNormal]) {

                data.push(normal2.toList());
                this.normals[currentFace.bNormal] = true;
                sent++;

            }

            if (normal3 !== undefined && !this.normals[currentFace.cNormal]) {

                data.push(normal3.toList());
                this.normals[currentFace.cNormal] = true;
                sent++;

            }

            var tex1 = this.mesh.texCoords[currentFace.aTexture];
            var tex2 = this.mesh.texCoords[currentFace.bTexture];
            var tex3 = this.mesh.texCoords[currentFace.cTexture];

            if (tex1 !== undefined && !this.texCoords[currentFace.aTexture]) {

                data.push(tex1.toList());
                this.texCoords[currentFace.aTexture] = true;
                sent++;

            }

            if (tex2 !== undefined && !this.texCoords[currentFace.bTexture]) {

                data.push(tex2.toList());
                this.texCoords[currentFace.bTexture] = true;
                sent++;

            }

            if (tex3 !== undefined && !this.texCoords[currentFace.cTexture]) {

                data.push(tex3.toList());
                this.texCoords[currentFace.cTexture] = true;
                sent++;

            }

            data.push(currentFace.toList());
            // this.meshFaces[meshIndex] = this.meshFaces[meshIndex] || [];
            this.meshFaces[meshIndex].array[faceIndex] = true;
            this.meshFaces[meshIndex].counter++;
            currentMesh.faceIndex++;

            sent++;

            if (sent > 500) {

                return {data: data, finished: false};

            }
        }
    }

    return {data: data, finished: mightBeCompletetlyFinished};

}

geo.MeshStreamer.prototype.isFinished = function(i) {

    return this.meshFaces[i].counter === this.meshFaces[i].array.length;

}
