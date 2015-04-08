var CameraContainer = function () {
    this.current_camera = 0;
    this.cameras = new Array();
}

CameraContainer.prototype.mainCamera = function(id) {
    if (id === undefined) {
        return this.cameras[this.current_camera];
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
    this.cameras[this.current_camera].look();
}

CameraContainer.prototype.update = function() {
    this.cameras[this.current_camera].update();
}

CameraContainer.prototype.push = function(camera) {
    this.cameras.push(camera);
}

CameraContainer.prototype.get = function(i) {
    return this.cameras[i];
}

CameraContainer.prototype.getById = function(id) {
    for (var i in this.cameras) {
        if (this.cameras[i].mesh !== undefined) {
            if (this.cameras[i].mesh.id == id) {
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
