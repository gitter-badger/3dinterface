var CameraContainer = function (pointerCamera, cameras) {
    if (cameras !== undefined) {
        this.cameras = cameras;
    } else {
        this.cameras = [];
    }

    if (pointerCamera !== undefined) {
        this.push(pointerCamera);
    }
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
    callback(this.pointerCamera);
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
        if (this.cameras[i] instanceof FixedCamera || this.cameras[i] instanceof ReverseCamera) {
            if (this.cameras[i].object3D !== undefined) {
                if (this.cameras[i].object3D.id == id) {
                    return this.get(i);
                }
            }
        } else if (this.cameras[i] instanceof OldFixedCamera) {
            if (this.cameras[i].mesh !== undefined) {
                if (this.cameras[i].mesh.id == id) {
                    return this.get(i);
                }
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
