var fs = require('fs');
var THREE = require('three');
var L3D = require('../../static/js/l3d.min.js');

try
{
    var predictionTables = [
        JSON.parse(fs.readFileSync('./geo/mat1.json')),
        JSON.parse(fs.readFileSync('./geo/mat2.json')),
        JSON.parse(fs.readFileSync('./geo/mat3.json')),
        [[1,1,0],
         [1,2,0],
         [2,1,0]]
    ];
} catch (e) {
    process.stderr.write('No prefetching will be done !');
    predictionTables = [];
}

function isInFrustum(element, planes) {

    if (element instanceof Array) {

        var outcodes = [];

        for (var i = 0; i < element.length; i++) {

            var vertex = element[i];
            var currentOutcode = "";

            for (var j = 0; j < planes.length; j++) {

                var plane = planes[j];

                distance =
                    plane.normal.x * vertex.x +
                    plane.normal.y * vertex.y +
                    plane.normal.z * vertex.z +
                    plane.constant;

                // if (distance < 0) {
                //     exitToContinue = true;
                //     break;
                // }

                currentOutcode += distance > 0 ? '0' : '1';

            }

            outcodes.push(parseInt(currentOutcode,2));

        }

        // http://vterrain.org/LOD/culling.html
        // I have no idea what i'm doing
        // http://i.kinja-img.com/gawker-media/image/upload/japbcvpavbzau9dbuaxf.jpg
        // But it seems to work
        // EDIT : Not, this should be ok http://www.cs.unc.edu/~blloyd/comp770/Lecture07.pdf

        if ((outcodes[0] | outcodes[1] | outcodes[2]) === 0) {
            return true;
        } else if ((outcodes[0] & outcodes[1] & outcodes[2]) !== 0) {
            return false;
        } else {
            // part of the triangle is inside the viewing volume
            return true;
        }

    }

}

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
    this.chunk = 1250;

    this.previousReco = 0;

    if (path !== undefined) {

        this.mesh = geo.availableMeshes[path];

    }

};

geo.MeshStreamer.prototype.isBackFace = function(camera, face) {

    var directionCamera = L3D.Tools.diff(
        L3D.Tools.mul(
            L3D.Tools.sum(
                L3D.Tools.sum(
                    this.mesh.vertices[face.a],
                    this.mesh.vertices[face.b]
                ),
                this.mesh.vertices[face.c]
            ),
        1/3),
        camera.position
    );

    var v1 = L3D.Tools.diff(this.mesh.vertices[face.b], this.mesh.vertices[face.a]);
    var v2 = L3D.Tools.diff(this.mesh.vertices[face.c], this.mesh.vertices[face.a]);

    var normal = L3D.Tools.cross(v1, v2);

    return L3D.Tools.dot(directionCamera, normal) > 0;
};

/**
 * Compute a function that can compare two faces
 * @param {Camera} camera a camera seeing or not face
 * @returns {function} the function that compares two faces : the higher face is the most interesting for the camera
 */
geo.MeshStreamer.prototype.faceComparator = function(camera) {

    var self = this;

    // var direction = {
    //     x: camera.target.x - camera.position.x,
    //     y: camera.target.y - camera.position.y,
    //     z: camera.target.z - camera.position.z
    // };

    // var norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);

    // direction.x /= norm;
    // direction.y /= norm;
    // direction.z /= norm;

    return function(face1, face2) {

        var center1 = {
            x: (self.mesh.vertices[face1.a].x + self.mesh.vertices[face1.b].x + self.mesh.vertices[face1.c].x) / 3,
            y: (self.mesh.vertices[face1.a].y + self.mesh.vertices[face1.b].y + self.mesh.vertices[face1.c].y) / 3,
            z: (self.mesh.vertices[face1.a].z + self.mesh.vertices[face1.b].z + self.mesh.vertices[face1.c].z) / 3

        };

        var dir1 = {
            x: center1.x - camera.position.x,
            y: center1.y - camera.position.y,
            z: center1.z - camera.position.z
        };

        // var norm1 = Math.sqrt(dir1.x * dir1.x + dir1.y * dir1.y + dir1.z + dir1.z);

        // dir1.x /= norm1;
        // dir1.y /= norm1;
        // dir1.z /= norm1;

        var dot1 = dir1.x * dir1.x + dir1.y * dir1.y + dir1.z * dir1.z;

        var center2 = {
            x: (self.mesh.vertices[face2.a].x + self.mesh.vertices[face2.b].x + self.mesh.vertices[face2.c].x) / 3,
            y: (self.mesh.vertices[face2.a].y + self.mesh.vertices[face2.b].y + self.mesh.vertices[face2.c].y) / 3,
            z: (self.mesh.vertices[face2.a].z + self.mesh.vertices[face2.b].z + self.mesh.vertices[face2.c].z) / 3
        };

        var dir2 = {
            x: center2.x - camera.position.x,
            y: center2.y - camera.position.y,
            z: center2.z - camera.position.z
        };

        // var norm2 = Math.sqrt(dir2.x * dir2.x + dir2.y * dir2.y + dir2.z + dir2.z);

        // dir2.x /= norm2;
        // dir2.y /= norm2;
        // dir2.z /= norm2;

        var dot2 = dir2.x * dir2.x + dir2.y * dir2.y + dir2.z * dir2.z;

        // Decreasing order
        if (dot1 < dot2) {
            return -1;
        }
        if (dot1 > dot2) {
            return 1;
        }
        return 0;

    };
};

/**
 * Initialize the socket.io callback
 * @param {socket} socket the socket to initialize
 */
geo.MeshStreamer.prototype.start = function(socket) {

    this.meshIndex = 0;
    this.socket = socket;

    var self = this;

    socket.on('request', function(path, laggy, prefetch) {

        if (laggy === true) {
            self.chunk = 1;
        }

        self.prefetch = prefetch;

        self.mesh = geo.availableMeshes[path];

        switch (path) {
            case '/static/data/bobomb/bobomb battlefeild.obj':
            case '/static/data/bobomb/bobomb battlefeild_sub.obj':
                self.predictionTable = predictionTables[0];
                break;
            case '/static/data/mountain/coocoolmountain.obj':
            case '/static/data/mountain/coocoolmountain_sub.obj':
                self.predictionTable = predictionTables[1];
                break;
            case '/static/data/whomp/Whomps Fortress.obj':
            case '/static/data/whomp/Whomps Fortress_sub.obj':
                self.predictionTable = predictionTables[2];
                break;
            default:
                self.predictionTable = predictionTables[3];
        };

        if (self.mesh === undefined) {
            process.stderr.write('Wrong path for model : ' + path);
            socket.emit('refused');
            socket.disconnect();
            return;
        }

        self.meshFaces = new Array(self.mesh.meshes.length);

        for (var i = 0; i < self.meshFaces.length; i++) {

            self.meshFaces[i] = {
                counter: 0,
                array: new Array(self.mesh.meshes[i].faces.length)
            };

        }

        socket.emit('ok');

    });

    socket.on('materials', function() {

        var data = self.nextMaterials();

        socket.emit('elements', data);

    });

    socket.on('reco', function(recoId) {

        self.previousReco = recoId + 1;

    });

    socket.on('next', function(_camera) {

        var cameraFrustum = {};

        // Clean camera attribute
        if (_camera !== null) {

            cameraFrustum = {
                position: {
                    x: _camera[0][0],
                    y: _camera[0][1],
                    z: _camera[0][2]
                },
                target: {
                    x: _camera[1][0],
                    y: _camera[1][1],
                    z: _camera[1][2]
                },
                planes: []
            };

            var fullFrustum = _camera[2];

            for (i = 3; i < _camera.length; i++) {

                cameraFrustum.planes.push({
                    normal: {
                        x: _camera[i][0],
                        y: _camera[i][1],
                        z: _camera[i][2]
                    },
                    constant: _camera[i][3]
                });

            }

        }

        // Create config for proportions of chunks
        var config;

        if (self.prefetch) {

            config = [{ frustum: cameraFrustum, proportion : 0.5}];

            // Find best recommendation
            var bestReco;
            var bestScore = -Infinity;
            var bestIndex = null;

            if (self.predictionTable !== undefined) {

                var sum = 0;

                for (var i = 0; i < self.mesh.recommendations.length; i++) {

                    sum += self.predictionTable[self.previousReco][i];

                }

                for (var i = 0; i < self.mesh.recommendations.length; i++) {

                    if (self.predictionTable[self.previousReco][i] > 0) {

                        config.push({

                            proportion : self.predictionTable[self.previousReco][i] / (2 * sum),
                            frustum : self.mesh.recommendations[i]

                        });

                    }

                }

                // console.log(config.map(function(o) { return o.proportion; }));

            } else {

                // For sponza
                bestReco = self.mesh.recommendations[0];

            }

            if (!fullFrustum) {

                // console.log('Frustum and prefetch : ' + (cameraFrustum !== undefined) + ' ' + (bestReco !== undefined));

            } else {

                // console.log('Full frustum fetching (reco clicked)');

                config = [{
                    proportion: 1,
                    frustum: cameraFrustum
                }];

            }

        } else {

            config = [{frustum: cameraFrustum, proportion: 1}];

        }

        // Send next elements
        var oldTime = Date.now();
        var next = self.nextElements(config);

        // console.log(next.configSizes);

        // console.log('Time to generate chunk : ' + (Date.now() - oldTime) + 'ms');

        if (self.prefetch && next.size < self.chunk) {

            // Recompute config
            var newConfig = [];
            var sum = 0;

            for (var i = 0; i < config.length; i++) {

                // Check if config was full
                if (next.configSizes[i] >= self.chunk * config[i].proportion) {

                    newConfig.push(config[i]);
                    sum += config[i].proportion;

                }

            }

            for (var i = 0; i < newConfig.length; i++) {

                newConfig[i].proportion /= sum;

            }

            // Normalize config probabilities

            var newData = self.nextElements(newConfig, self.chunk - next.size);

            next.data.push.apply(next.data, newData.data);

            // console.log('Adding ' + newData.size + ' for newConfig : ' + JSON.stringify(newConfig.map(function(o) { return o.proportion})));

            next.size = next.size + newData.size;

        }

        if (next.size < self.chunk) {

            // If nothing, just serve stuff
            var tmp = self.nextElements([
                // {
                //     proportion: 1,
                //     frustum: cameraFrustum
                // }
            ], self.chunk - next.size);

            next.data.push.apply(next.data, tmp.data);
            next.size += tmp.size;

        }

        // console.log('Chunk of size ' + next.size);
        // console.log('Time to generate chunk : ' + (Date.now() - oldTime) + 'ms');

        if (next.data.length === 0) {

            socket.disconnect();

        } else {

            socket.emit('elements', next.data);

        }

    });
};

/**
 * Prepare the array of materials
 * @return array the array to send with all materials of the current mesh
 */
geo.MeshStreamer.prototype.nextMaterials = function() {

    var data = [];

    data.push(['g', this.mesh.numberOfFaces]);


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

};

/**
 * Prepare the next elements
 * @param {camera} _camera a camera that can be usefull to do smart streaming (stream
 * only interesting parts according to the camera
 * @returns {array} an array of elements ready to send
 */
geo.MeshStreamer.prototype.nextElements = function(config, chunk) {

    if (chunk === undefined)
        chunk = this.chunk;

    var i;

    var data = [];

    var configSizes = [];
    var buffers = [];

    var mightBeCompletetlyFinished = true;

    // BOOM
    // if (camera != null)
    //     this.mesh.faces.sort(this.faceComparator(camera));

    if (config.length === 0) {
        config.push({
            proportion: 1
        });
    }

    totalSize = 0;
    for (var configIndex = 0; configIndex < config.length; configIndex++) {

        configSizes[configIndex] = 0;
        buffers[configIndex] = [];

    }

    faceloop:
    for (var faceIndex = 0; faceIndex < this.mesh.faces.length; faceIndex++) {

        var currentFace = this.mesh.faces[faceIndex];

        if (this.faces[currentFace.index] === true) {

            continue;

        }

        mightBeCompletetlyFinished = false;

        var vertex1 = this.mesh.vertices[currentFace.a];
        var vertex2 = this.mesh.vertices[currentFace.b];
        var vertex3 = this.mesh.vertices[currentFace.c];

        for (var configIndex = 0; configIndex < config.length; configIndex++) {

            var currentConfig = config[configIndex];

            var display = false;
            var exitToContinue = false;
            var threeVertices = [vertex1, vertex2, vertex3];

            // Frustum culling
            if (currentConfig.frustum === undefined || (isInFrustum(threeVertices, currentConfig.frustum.planes) && !this.isBackFace(currentConfig.frustum, currentFace))) {

                buffers[configIndex].push(currentFace);
                continue faceloop;

            }

        }

    }

    var totalSize = 0;
    var configSize = 0;

    for (var configIndex = 0; configIndex < config.length; configIndex++) {

        // Sort buffer
        if (config[configIndex].frustum !== undefined) {
            buffers[configIndex].sort(this.faceComparator(config[configIndex].frustum));
        } else {
            // console.log("Did not sort");
        }

        // Fill chunk
        for(var i = 0; i < buffers[configIndex].length; i++) {

            var size = this.pushFace(buffers[configIndex][i], data);

            totalSize += size;
            configSize += size;

            if (configSize > chunk * config[configIndex].proportion) {

                break;

            }

        }

        if (totalSize > chunk) {

            // console.log(configIndex, sent/(chunk * currentConfig.proportion));
            return {data: data, finsihed:false, configSizes: configSizes, size: totalSize};

        }

    }

    return {data: data, finished: mightBeCompletetlyFinished, configSizes: configSizes, size:totalSize};

};

geo.MeshStreamer.prototype.pushFace = function(face, buffer) {

    var totalSize = 0;

    var vertex1 = this.mesh.vertices[face.a];
    var vertex2 = this.mesh.vertices[face.b];
    var vertex3 = this.mesh.vertices[face.c];

    // Send face
    if (!this.vertices[face.a]) {

        buffer.push(vertex1.toList());
        this.vertices[face.a] = true;
        totalSize++;

    }

    if (!this.vertices[face.b]) {

        buffer.push(vertex2.toList());
        this.vertices[face.b] = true;
        totalSize++;

    }

    if (!this.vertices[face.c]) {

        buffer.push(vertex3.toList());
        this.vertices[face.c] = true;
        totalSize++;

    }

    var normal1 = this.mesh.normals[face.aNormal];
    var normal2 = this.mesh.normals[face.bNormal];
    var normal3 = this.mesh.normals[face.cNormal];

    if (normal1 !== undefined && !this.normals[face.aNormal]) {

        buffer.push(normal1.toList());
        this.normals[face.aNormal] = true;
        totalSize++;

    }

    if (normal2 !== undefined && !this.normals[face.bNormal]) {

        buffer.push(normal2.toList());
        this.normals[face.bNormal] = true;
        totalSize++;

    }

    if (normal3 !== undefined && !this.normals[face.cNormal]) {

        buffer.push(normal3.toList());
        this.normals[face.cNormal] = true;
        totalSize++;

    }

    var tex1 = this.mesh.texCoords[face.aTexture];
    var tex2 = this.mesh.texCoords[face.bTexture];
    var tex3 = this.mesh.texCoords[face.cTexture];

    if (tex1 !== undefined && !this.texCoords[face.aTexture]) {

        buffer.push(tex1.toList());
        this.texCoords[face.aTexture] = true;
        totalSize++;

    }

    if (tex2 !== undefined && !this.texCoords[face.bTexture]) {

        buffer.push(tex2.toList());
        this.texCoords[face.bTexture] = true;
        totalSize++;

    }

    if (tex3 !== undefined && !this.texCoords[face.cTexture]) {

        buffer.push(tex3.toList());
        this.texCoords[face.cTexture] = true;
        totalSize++;

    }

    buffer.push(face.toList());
    // this.meshFaces[meshIndex] = this.meshFaces[meshIndex] || [];
    this.faces[face.index] = true;
    totalSize+=3;

    return totalSize;
};

geo.MeshStreamer.prototype.isFinished = function(i) {

    return this.meshFaces[i].counter === this.meshFaces[i].array.length;

};
