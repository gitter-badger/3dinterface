var fs = require('fs');
var THREE = require('three');
var L3D = require('../../static/js/l3d.min.js');

function readIt(sceneNumber, recoId) {
    var toZip = {
        triangles :
            JSON.parse(fs.readFileSync('./geo/generated/scene' + sceneNumber + '/triangles' + recoId + '.json')),
        areas :
            JSON.parse(fs.readFileSync('./geo/generated/scene' + sceneNumber + '/areas' + recoId + '.json'))
    };

    var ret = [];

    for (var i = 0; i < toZip.triangles.length; i++) {
        ret.push({
            index: toZip.triangles[i],
            area:  toZip.areas[i]
        });
    }

    return ret;
}

numberOfReco = [0, 0, 12, 12, 11, 2];

function readAll(sceneNumber) {
    var ret = [];

    for (var i = 0; i < numberOfReco[sceneNumber]; i++) {
        ret.push(readIt(sceneNumber, i));
    }

    return ret;

}

try
{
    var predictionTables = [
        JSON.parse(fs.readFileSync('./geo/mat1.json')),
        JSON.parse(fs.readFileSync('./geo/mat2.json')),
        JSON.parse(fs.readFileSync('./geo/mat3.json')),
        [[1,1],
         [1,2]]
    ];

    var facesToSend = [
        readAll(2),
        readAll(3),
        readAll(4),
        readAll(5)
    ];

} catch (e) {
    process.stderr.write('No prefetching will be done !');
    predictionTables = [];
}

/**
 * Checks quickly if a triangle might be in a frustum
 * @private
 * @param {Object[]} element array of thre 3 vertices of the triangle to test
 * @param {Object[]} planes array of planes (Object with normal and constant values)
 * @return {Boolean} false if we can be sure that the triangle is not in the frustum, true oherwise
 */
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

    this.beginningThreshold = 0.9;

    this.frustumPercentage = 0.6;
    this.prefetchPercentage = 1 - this.frustumPercentage;

    /**
     * Number of element to send by packet
     * @type {Number}
     */
    // this.chunk = 100000;
    this.chunk = 1250;

    this.previousReco = 0;

    if (path !== undefined) {

        this.mesh = geo.availableMeshes[path];

    }

};

/**
 * Checks if a face is oriented towards the camera
 * @param {Object} camera a camera (with a position, and a direction)
 * @param {geo.Face} the face to test
 * @return {Boolean} true if the face is in the good orientation, face otherwise
 */
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
 * Initialize the socket.io callbacks
 * @param {socket} socket the socket to initialize
 */
geo.MeshStreamer.prototype.start = function(socket) {

    this.socket = socket;

    var self = this;

    socket.on('request', function(path, laggy, prefetch) {

        if (laggy === true) {
            self.chunk = 1;
        }

        self.mesh = geo.availableMeshes[path];

        switch (path) {
            case '/static/data/bobomb/bobomb battlefeild.obj':
            case '/static/data/bobomb/bobomb battlefeild_sub.obj':
                self.predictionTable = predictionTables[0];
                self.facesToSend = facesToSend[0];
                break;
            case '/static/data/mountain/coocoolmountain.obj':
            case '/static/data/mountain/coocoolmountain_sub.obj':
                self.predictionTable = predictionTables[1];
                self.facesToSend = facesToSend[1];
                break;
            case '/static/data/whomp/Whomps Fortress.obj':
            case '/static/data/whomp/Whomps Fortress_sub.obj':
                self.predictionTable = predictionTables[2];
                self.facesToSend = facesToSend[2];
                break;
            case '/static/data/sponza/sponza.obj':
                self.predictionTable = predictionTables[3];
                self.facesToSend = facesToSend[3];
                break;
            default:
                self.predictionTable = predictionTables[3];
        };

        self.generator = geo.ConfigGenerator.createFromString(prefetch, self);
        self.backupGenerator = new geo.ConfigGenerator(self);

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

    socket.on('next', function(_camera) { // score) {

        var cameraFrustum = {};
        var beginning = self.beginning;
        var cameraExists = false;

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

            var recommendationClicked = _camera[2];

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

            cameraExists = true;

        }

        if (cameraExists) {

            // Create config for proportions of chunks
            var didPrefetch = false;
            var config = self.generator.generateMainConfig(cameraFrustum, recommendationClicked);

            // Send next elements
            var oldTime = Date.now();
            var next = self.nextElements(config);

            // console.log(
            //     'Adding ' +
            //     next.size +
            //     ' for newConfig : '
            //     + JSON.stringify(config.map(function(o) { return o.proportion}))
            // );


            if (self.beginning === true && next.size < self.chunk) {

                self.beginning = false;
                config = self.generator.generateMainConfig(cameraFrustum, recommendationClicked);

            }

            var fillElements = self.nextElements(config, self.chunk - next.size);

            next.configSizes = fillElements.configSizes;
            next.data.push.apply(next.data, fillElements.data);
            next.size += fillElements.size;

            // Chunk is not empty, compute fill config
            if (next.size < self.chunk) {

                config = self.generator.generateFillingConfig(config, next, cameraFrustum, recommendationClicked);
                fillElements = self.nextElements(config, self.chunk - next.size);

                next.data.push.apply(next.data, fillElements.data);
                next.size += fillElements.size;

            }

            // If still not empty, fill linear
            if (next.size < self.chunk) {

                fillElements = self.nextElements([], self.chunk - next.size);

                next.data.push.apply(next.data, fillElements.data);
                next.size += fillElements.size;

            }

        } else {

            config = self.backupGenerator.generateMainConfig();
            next = self.nextElements(config, self.chunk);

        }

        console.log('Chunk of size ' + next.size + ' (generated in ' + (Date.now() - oldTime) + 'ms)');

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
 * @param {Object[]} config a configuration list
 * @returns {array} an array of elements ready to send
 * @see {@link https://github.com/DragonRock/3dinterface/wiki/Streaming-configuration|Configuration list documentation}
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
            if (!currentConfig.smart && (currentConfig.frustum === undefined || (isInFrustum(threeVertices, currentConfig.frustum.planes) && !this.isBackFace(currentConfig.frustum, currentFace)))) {

                buffers[configIndex].push(currentFace);
                continue faceloop;

            }

        }

    }

    // Fill smart recos
    for (var configIndex = 0; configIndex < config.length; configIndex++) {

        var currentConfig = config[configIndex];

        if (!currentConfig.smart) {

            continue;

        }

        var area = 0;
        var currentArea = 0;

        // Fill buffer using facesToSend
        for (var faceIndex = 0; faceIndex < this.facesToSend[currentConfig.recommendationId].length; faceIndex++) {

            var faceInfo = this.facesToSend[currentConfig.recommendationId][faceIndex];

            area += faceInfo.area;

            if (area > 0.9) {
                break;
            }

            if (this.faces[faceInfo.index] !== true) {

                var face = this.mesh.faces[faceInfo.index];

                if (face === undefined) {
                    console.log(faceInfo.index, this.mesh.faces.length);
                    console.log('ERROR !!!');
                } else {
                    buffers[configIndex].push(face);
                }

            } else if (this.beginning === true) {

                currentArea += faceInfo.area;

                if (currentArea > this.beginningThreshold) {

                    this.beginning = false;

                }

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

            // console.log(buffers[configIndex][i]);
            var size = this.pushFace(buffers[configIndex][i], data);

            totalSize += size;
            configSizes[configIndex] += size;

            if (configSizes[configIndex] > chunk * config[configIndex].proportion) {

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
    this.faces[face.index] = true;
    totalSize+=3;

    return totalSize;
};

geo.MeshStreamer.prototype.isFinished = function(i) {

    return this.meshFaces[i].counter === this.meshFaces[i].array.length;

};
