var CameraContainer = function () {
    this.cameras = new Array();
}

CameraContainer.prototype.mainCamera = function(id) {
    if (id === undefined) {
        return this.pointerCamera;
    }
    if (id >= cameras.length || id < 0) {
        console.log('Warning : this camera does not exist');
        return;
    }

    this.current_camera = id;
}

CameraContainer.prototype.forEach = function(callback) {
    this.cameras.forEach(callback);
}

CameraContainer.prototype.look = function() {
    this.mainCamera().look();
}

CameraContainer.prototype.updateMainCamera = function() {
    this.pointerCamera.update();
}

CameraContainer.prototype.update = function(position) {
    this.cameras.map(function (elt) { elt.update(position); });
}

CameraContainer.prototype.push = function(camera) {
    this.pointerCamera = camera;
    this.push = function(camera) {
        this.cameras.push(camera);
    };
}

CameraContainer.prototype.get = function(i) {
    return this.cameras[i];
}

CameraContainer.prototype.getById = function(id) {
    for (var i in this.cameras) {
        if (this.cameras[i].object3D !== undefined) {
            if (this.cameras[i].object3D.id == id) {
                return this.get(i);
            }
        }
    }
}

CameraContainer.prototype.setById = function(id) {
    var i = this.getById(id);

    if (i !== -1)
        this.current_camera = i;
}

CameraContainer.prototype.nextCamera = function() {
    if (this.cameras.length != 0) {
        this.current_camera++;
        this.current_camera%=this.cameras.length;
    }
}

CameraContainer.prototype.map = function(callback) {
    this.cameras.map(callback);
}
