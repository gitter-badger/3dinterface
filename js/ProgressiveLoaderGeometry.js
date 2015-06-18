var _parseList2 = function(arr) {

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
        ret.mesh = arr[2];

        // Only Face3 are allowed
        vertexIndices  = arr[3];
        textureIndices = arr[4];
        normalIndices  = arr[5];

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

var ProgressiveLoaderGeometry = function(path, scene, camera, callback) {

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
    this.meshes = [];

    // Init MTLLoader
    this.loader = new THREE.MTLLoader(this.texturesPath);

    // Init io stuff
    this.socket = io();
    this.initIOCallbacks();

    this.camera = camera;

}

ProgressiveLoaderGeometry.prototype.load = function() {

    var self = this;

    this.loader.load(self.mtlPath, function(materialCreator) {

        self.materialCreator = materialCreator;

        materialCreator.preload();

        self.start();

    });
}

ProgressiveLoaderGeometry.prototype.getCamera = function() {
    if (this.camera !== null)
        return [this.camera.position.x, this.camera.position.y, this.camera.position.z,
                this.camera.target.x,   this.camera.target.y,   this.camera.target.z];
    else
       return null;

}

ProgressiveLoaderGeometry.prototype.initIOCallbacks = function() {

    var self = this;

    this.socket.on('ok', function() {
        console.log('ok');
        self.socket.emit('next', self.getCamera());
    });

    this.socket.on('elements', function(arr) {

        if (arr.length === 0) {

            console.log("Empty array");

        } else {

            console.log("Stuff received");

        }


        // console.log("Received elements for the " + (++self.counter) + "th time !");
        for (var i = 0; i < arr.length; i++) {

            var elt = _parseList2(arr[i]);

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
                self.meshes.push(mesh);

                self.currentMesh = mesh;

                if (typeof self.callback === 'function') {
                    self.callback(mesh);
                }

            } else if (elt.type === 'face') {

                if (!self.meshes[elt.mesh].added) {

                    self.meshes[elt.mesh].added = true;
                    self.obj.add(self.meshes[elt.mesh]);

                }

                if (elt.aNormal !== undefined) {
                    self.meshes[elt.mesh].geometry.faces.push(new THREE.Face3(elt.a, elt.b, elt.c, [self.normals[elt.aNormal], self.normals[elt.bNormal], self.normals[elt.cNormal]]));
                } else {
                    self.meshes[elt.mesh].geometry.faces.push(new THREE.Face3(elt.a, elt.b, elt.c));
                    self.meshes[elt.mesh].geometry.computeFaceNormals();
                    self.meshes[elt.mesh].geometry.computeVertexNormals();
                }

                if (elt.aTexture !== undefined) {

                    self.meshes[elt.mesh].geometry.faceVertexUvs[0].push([self.texCoords[elt.aTexture], self.texCoords[elt.bTexture], self.texCoords[elt.cTexture]]);

                }

                self.meshes[elt.mesh].geometry.verticesNeedUpdate = true;
                self.meshes[elt.mesh].geometry.uvsNeedUpdate = true;
                self.meshes[elt.mesh].geometry.normalsNeedUpdate = true;
                self.meshes[elt.mesh].geometry.groupsNeedUpdate = true;

            }

        }

        // Ask for next elements
        self.socket.emit('next', self.getCamera());
    });

    this.socket.on('disconnect', function() {
        console.log('Finished !');
        self.finished = true;
    });
}

ProgressiveLoaderGeometry.prototype.start = function() {
    this.socket.emit('request', this.objPath);
}

