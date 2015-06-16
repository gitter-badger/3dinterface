var _parseList = function(arr) {

    // For example
    // arr = [  'f',    0,    0,     1,    2];
    //        type  index first second third

    var ret = {};
    ret.index = arr[1];

    if (arr[0] === 'v') {
        ret.type = 'vertex';
        ret.x = arr[2];
        ret.y = arr[3];
        ret.z = arr[4];
    } else if (arr[0] === 'vt') {
        ret.type = 'texCoord';
        ret.x = arr[2];
        ret.y = arr[3];
    } else if (arr[0] === 'f') {
        ret.type = 'face';

        // Only Face3 are allowed
        vertexIndices  = arr[2];
        textureIndices = arr[3];
        normalIndices  = arr[4];

        // Vertex indices
        ret.a = vertexIndices[0];
        ret.b = vertexIndices[1];
        ret.c = vertexIndices[2];

        // Texutre indices (if they exist)
        if (textureIndices.length > 0) {
            ret.aTexture = textureIndices[0];
            ret.bTexture = textureIndices[1];
            ret.cTexture = textureIndices[2];
        }

        // Normal indices (if they exist)
        if (normalIndices.length > 0) {
            ret.aNormal = normalIndices[0];
            ret.bNormal = normalIndices[1];
            ret.cNormal = normalIndices[2];
        }

    } else if (arr[0] === 'vn') {

        // Normal
        ret.type = "normal";
        ret.x = arr[2];
        ret.y = arr[3];
        ret.z = arr[4];

    }

    return ret;
}

var ProgressiveLoader = function(path, scene, callback) {
    // Init attributes
    this.objPath = path;
    this.texturesPath = '/' + path.substring(0, path.lastIndexOf('/')) + '/';
    this.mtlPath = '/' + path.replace('.obj', '.mtl');
    this.scene = scene;
    this.callback = callback;
    this.counter = 0;

    this.obj = new THREE.Object3D();

    scene.add(this.obj);

    this.vertices = [];
    this.texCoords = [];
    this.normals = [];

    // Init MTLLoader
    this.loader = new THREE.MTLLoader(this.texturesPath);

    // Init io stuff
    this.socket = io();
    this.initIOCallbacks();

}

ProgressiveLoader.prototype.load = function() {

    var self = this;

    this.loader.load(self.mtlPath, function(materialCreator) {

        self.materialCreator = materialCreator;

        materialCreator.preload();

        self.start();

    });
}

ProgressiveLoader.prototype.initIOCallbacks = function() {

    var self = this;

    this.socket.on('usemtl', function(materialName, verticesNumber, facesNumber, texCoordsExist, normalsExist) {

        // console.log("New mesh arrived : " + materialName);

        // Create mesh material
        var material;

        if (materialName === null) {

            // If no material, create a default material
            material = new THREE.MeshLambertMaterial({color: 'red'});

        } else {

            // If material name exists, load if from material, and do a couple of settings
            material = self.materialCreator.materials[materialName.trim()];

            material.side = THREE.DoubleSide;

            if (material.map)
                material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        }

        // Create mesh geometry
        var geometry = new THREE.BufferGeometry();
        geometry.dynamic = true;

        var positionArray = new Float32Array(facesNumber * 3 * 3);
        var positionAttribute = new THREE.BufferAttribute(positionArray, 3);

        geometry.addAttribute('position', positionAttribute);

        // Add other attributes if necessary
        if (texCoordsExist) {

            // console.log("Mesh with textures");

            var uvArray = new Float32Array(facesNumber * 3 * 2);
            var uvAttribute = new THREE.BufferAttribute(uvArray, 2);

            geometry.addAttribute('uv', uvAttribute);
        }

        if (normalsExist) {

            // console.log("Mesh with normals");

            var normalArray = new Float32Array(facesNumber * 3 * 3);
            var normalAttribute = new THREE.BufferAttribute(normalArray, 3);

            geometry.addAttribute('normal', normalAttribute);

        }

        // Create mesh
        var mesh = new THREE.Mesh(geometry, material);

        self.currentMesh = mesh;
        self.obj.add(mesh);

        if (typeof self.callback === 'function') {
            self.callback(mesh);
        }

        // Ask for next
        self.socket.emit('next');
    });

    this.socket.on('ok', function() {
        console.log('ok');
        self.socket.emit('next');
    });

    this.socket.on('elements', function(arr) {

        // console.log("Received elements for the " + (++self.counter) + "th time !");

        for (var i = 0; i < arr.length; i++) {

            var elt = _parseList(arr[i]);

            // console.log(elts);
            if (elt.type === 'vertex') {

                // New vertex arrived
                self.vertices[elt.index] = [elt.x, elt.y, elt.z];

            } else if (elt.type === 'texCoord') {

                // New texCoord arrived
                self.texCoords[elt.index] = [elt.x, elt.y];

            } else if (elt.type === 'normal') {

                // New normal arrived
                self.normals[elt.index] = [elt.x, elt.y, elt.z];

            } else if (elt.type === 'face') {

                // New face arrived : add it into current mesh
                self.currentMesh.geometry.attributes.position.array[elt.index * 9    ] =  self.vertices[elt.a][0];
                self.currentMesh.geometry.attributes.position.array[elt.index * 9 + 1] =  self.vertices[elt.a][1];
                self.currentMesh.geometry.attributes.position.array[elt.index * 9 + 2] =  self.vertices[elt.a][2];

                self.currentMesh.geometry.attributes.position.array[elt.index * 9 + 3] =  self.vertices[elt.b][0];
                self.currentMesh.geometry.attributes.position.array[elt.index * 9 + 4] =  self.vertices[elt.b][1];
                self.currentMesh.geometry.attributes.position.array[elt.index * 9 + 5] =  self.vertices[elt.b][2];

                self.currentMesh.geometry.attributes.position.array[elt.index * 9 + 6] =  self.vertices[elt.c][0];
                self.currentMesh.geometry.attributes.position.array[elt.index * 9 + 7] =  self.vertices[elt.c][1];
                self.currentMesh.geometry.attributes.position.array[elt.index * 9 + 8] =  self.vertices[elt.c][2];

                self.currentMesh.geometry.attributes.position.needsUpdate = true;

                // If normals
                if (elt.aNormal !== undefined) {

                    self.currentMesh.geometry.attributes.normal.array[elt.index * 9    ] =  self.normals[elt.aNormal][0];
                    self.currentMesh.geometry.attributes.normal.array[elt.index * 9 + 1] =  self.normals[elt.aNormal][1];
                    self.currentMesh.geometry.attributes.normal.array[elt.index * 9 + 2] =  self.normals[elt.aNormal][2];

                    self.currentMesh.geometry.attributes.normal.array[elt.index * 9 + 3] =  self.normals[elt.bNormal][0];
                    self.currentMesh.geometry.attributes.normal.array[elt.index * 9 + 4] =  self.normals[elt.bNormal][1];
                    self.currentMesh.geometry.attributes.normal.array[elt.index * 9 + 5] =  self.normals[elt.bNormal][2];

                    self.currentMesh.geometry.attributes.normal.array[elt.index * 9 + 6] =  self.normals[elt.cNormal][0];
                    self.currentMesh.geometry.attributes.normal.array[elt.index * 9 + 7] =  self.normals[elt.cNormal][1];
                    self.currentMesh.geometry.attributes.normal.array[elt.index * 9 + 8] =  self.normals[elt.cNormal][2];

                    self.currentMesh.geometry.attributes.normal.needsUpdate = true;

                }

                if (elt.aTexture !== undefined) {

                    self.currentMesh.geometry.attributes.uv.array[elt.index * 9    ] =  self.texCoords[elt.aTexture][0];
                    self.currentMesh.geometry.attributes.uv.array[elt.index * 9 + 1] =  self.texCoords[elt.aTexture][1];

                    self.currentMesh.geometry.attributes.uv.array[elt.index * 9 + 2] =  self.texCoords[elt.bTexture][0];
                    self.currentMesh.geometry.attributes.uv.array[elt.index * 9 + 3] =  self.texCoords[elt.bTexture][1];

                    self.currentMesh.geometry.attributes.uv.array[elt.index * 9 + 4] =  self.texCoords[elt.cTexture][0];
                    self.currentMesh.geometry.attributes.uv.array[elt.index * 9 + 5] =  self.texCoords[elt.cTexture][1];

                    self.currentMesh.geometry.attributes.uv.needsUpdate = true;
                }

            }

        }

        // Ask for next elements
        self.socket.emit('next');
    });

    this.socket.on('disconnect', function() {
        console.log('Finished !');
        self.finished = true;
    });
}

ProgressiveLoader.prototype.start = function() {
    this.socket.emit('request', this.objPath);
}

