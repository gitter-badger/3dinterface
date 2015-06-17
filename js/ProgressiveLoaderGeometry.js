var _parseList = function(arr) {

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

    } else if (arr[0] === 'u') {

        // usemtl
        ret.index = -1;
        ret.type = 'usemtl';
        ret.materialName = arr[1];
        ret.vLength = arr[2];
        ret.fLength = arr[3];
        ret.texCoordsExist = arr[4];
        ret.normalsExist = arr[5];

    }

    return ret;
}

var ProgressiveLoaderGeometry = function(path, scene, callback) {
    // Init attributes
    this.objPath = path.substring(1, path.length);
    this.texturesPath = path.substring(0, path.lastIndexOf('/')) + '/';
    this.mtlPath = path.replace('.obj', '.mtl');
    this.scene = scene;
    this.callback = callback;
    this.counter = 0;

    this.obj = new THREE.Object3D();

    scene.add(this.obj);

    this.vertices = [];
    this.texCoords = [];
    this.normals = [];
    this.uvs = [];

    // Init MTLLoader
    this.loader = new THREE.MTLLoader(this.texturesPath);

    // Init io stuff
    this.socket = io();
    this.initIOCallbacks();

}

ProgressiveLoaderGeometry.prototype.load = function() {

    var self = this;

    this.loader.load(self.mtlPath, function(materialCreator) {

        self.materialCreator = materialCreator;

        materialCreator.preload();

        self.start();

    });
}

ProgressiveLoaderGeometry.prototype.initIOCallbacks = function() {

    var self = this;

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
                while (elt.index > self.vertices.length) {

                    self.vertices.push(new THREE.Vector3());

                }

                self.vertices[elt.index] = new THREE.Vector3(elt.x, elt.y, elt.z);
                self.currentMesh.geometry.verticesNeedUpdate = true;

            } else if (elt.type === 'texCoord') {

                // New texCoord arrived
                self.texCoords[elt.index] = new THREE.Vector2(elt.x, elt.y);
                self.currentMesh.geometry.uvsNeedUpdate = true;

            } else if (elt.type === 'normal') {

                // New normal arrived
                self.normals[elt.index] = new THREE.Vector3(elt.x, elt.y, elt.z);

            } else if (elt.type === 'usemtl') {

                if (self.currentMesh !== undefined) {

                    // if (self.currentMesh.geometry.attributes.normal === undefined) {

                    //     self.currentMesh.geometry.computeVertexNormals();

                    // }

                }

                // Must create new mesh
                // console.log("New mesh arrived : " + elt.materialName);

                // Create mesh material
                var material;

                if (elt.materialName === null) {

                    // If no material, create a default material
                    material = new THREE.MeshLambertMaterial({color: 'red'});

                } else {

                    // If material name exists, load if from material, and do a couple of settings
                    material = self.materialCreator.materials[elt.materialName.trim()];

                    material.side = THREE.DoubleSide;

                    if (material.map)
                        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
                }

                // Create mesh geometry
                self.uvs = [];
                var geometry = new THREE.Geometry();
                geometry.vertices = self.vertices;
                geometry.faces = [];

                // If texture coords, init faceVertexUvs attribute
                if (elt.texCoordsExist) {
                    geometry.faceVertexUvs = [self.uvs];
                }

                geometry.dynamic = true;

                // Create mesh
                var mesh = new THREE.Mesh(geometry, material);

                self.currentMesh = mesh;
                self.obj.add(mesh);

                if (typeof self.callback === 'function') {
                    self.callback(mesh);
                }

            } else if (elt.type === 'face') {

                self.currentMesh.geometry.faces.push(new THREE.Face3(elt.a, elt.b, elt.c, [self.normals[elt.aNormal], self.normals[elt.bNormal], self.normals[elt.cNormal]]));

                if (elt.aTexture !== undefined) {

                    self.currentMesh.geometry.faceVertexUvs[0].push([self.texCoords[elt.aTexture], self.texCoords[elt.bTexture], self.texCoords[elt.cTexture]]);

                }

                self.currentMesh.geometry.verticesNeedUpdate = true;
                self.currentMesh.geometry.uvsNeedUpdate = true;
                self.currentMesh.geometry.normalsNeedUpdate = true;
                self.currentMesh.geometry.groupsNeedUpdate = true;

            }

        }

        // Ask for next elements
        self.socket.emit('next');
    });

    this.socket.on('disconnect', function() {
        console.log('Finished !');
        self.currentMesh.geometry.computeBoundingSphere();
        // if (self.currentMesh.geometry.attributes.normal === undefined) {
        //     self.currentMesh.geometry.computeVertexNormals();
        // }
        self.finished = true;
    });
}

ProgressiveLoaderGeometry.prototype.start = function() {
    this.socket.emit('request', this.objPath);
}

