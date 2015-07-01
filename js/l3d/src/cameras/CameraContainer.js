L3D.CameraContainer = function (pointerCamera, cameras) {
    if (cameras !== undefined) {
        this.cameras = cameras;
    } else {
        this.cameras = [];
    }

    if (pointerCamera !== undefined) {
        this.push(pointerCamera);
    }
};

L3D.CameraContainer.prototype.mainCamera = function(id) {
    if (id === undefined) {
        return this.pointerCamera;
    }
    if (id >= cameras.length || id < 0) {
        console.log('Warning : this camera does not exist');
        return;
    }

    this.current_camera = id;
};

L3D.CameraContainer.prototype.forEach = function(callback) {
    callback(this.pointerCamera);
    this.cameras.forEach(callback);
};

L3D.CameraContainer.prototype.look = function() {
    this.mainCamera().look();
};

L3D.CameraContainer.prototype.updateMainCamera = function(time) {
    this.pointerCamera.update(time);
};

L3D.CameraContainer.prototype.update = function(position) {
    this.cameras.map(function (elt) { elt.update(position); });
};

L3D.CameraContainer.prototype.push = function(camera) {
    this.pointerCamera = camera;
    this.push = function(camera) {
        this.cameras.push(camera);
    };
};

L3D.CameraContainer.prototype.get = function(i) {
    return this.cameras[i];
};

L3D.CameraContainer.prototype.getByObject = function(object) {
    for (var i in this.cameras) {
        if (this.cameras[i].containsObject(object)) {
            return this.get(i);
        }
    }
};

L3D.CameraContainer.prototype.setById = function(id) {
    var i = this.getById(id);

    if (i !== -1)
        this.current_camera = i;
};

L3D.CameraContainer.prototype.nextCamera = function() {
    if (this.cameras.length !== 0) {
        this.current_camera++;
        this.current_camera%=this.cameras.length;
    }
};

L3D.CameraContainer.prototype.map = function(callback) {
    this.cameras.map(callback);
};
