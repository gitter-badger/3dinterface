var CameraSelecter = function(renderer, scene, cameras, coins, buttonManager) {
    this.raycaster = new THREE.Raycaster();
    this.renderer = renderer;
    this.mouse = {};
    this.cameras = cameras;
    this.prev = {};
    this.buttonManager = buttonManager;
    this.scene = scene;
    this.coins = coins;
};

CameraSelecter.prototype.pointedCamera = function() {
    var returnCamera;

    var x = ( this.mouse.x / this.renderer.domElement.width ) * 2 - 1;
    var y = - (this.mouse.y / this.renderer.domElement.height) * 2 + 1;

    var camera = this.cameras.mainCamera();

    if (camera.pointerLocked) {

        this.mouse.x = this.renderer.domElement.width/2 ;
        this.mouse.y = this.renderer.domElement.height/2 ;
        x = 0;
        y = 0;

    }

    var vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera);

    this.raycaster.set(camera.position, vector.sub(camera.position).normalize());

    var intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if ( intersects.length > 0 ) {
        var minDistance;
        var bestIndex;

        // Looking for cameras
        for (var i in intersects) {
            if (intersects[i].object.raycastable && !(intersects[i].object instanceof THREE.Line)) {
                if ((intersects[i].distance > 0.5 && minDistance === undefined) || (intersects[i].distance < minDistance )) {
                    if (!(intersects[i].object instanceof THREE.Mesh && intersects[i].object.material.opacity < 0.1)) {
                        minDistance = intersects[i].distance;
                        bestIndex = i;
                    }
                }
            }
        }

        if (bestIndex !== undefined) {
            // if (this.cameras.getById(intersects[bestIndex].object.parent.id) !== undefined) {
                var obj = intersects[bestIndex].object;

                for (var coin in this.coins) {
                    if (obj === this.coins[coin].mesh) {
                        return this.coins[coin];
                    }
                }
                this.currentPointedCamera = this.cameras.getByObject(intersects[bestIndex].object);
                return this.currentPointedCamera;
            // }
        }
    }
    this.currentPointedCamera = null;
};

CameraSelecter.prototype.update = function(event, y) {
    var e;

    if (event !== undefined) {
        this.mouse.x = event.offsetX === undefined ? event.layerX : event.offsetX;
        this.mouse.y = event.offsetY === undefined ? event.layerY : event.offsetY;
    }

    if (y !== undefined) {
        this.mouse.x = this.renderer.domElement.width/2;
        this.mouse.y = this.renderer.domElement.height/2;
    }

    var previousCamera = this.currentPointedCamera;
    var hovered = this.pointedCamera();

    if (hovered !== undefined && !(hovered instanceof Coin)) {
        if (hovered !== previousCamera) {
            // log it
            e = new BD.Event.Hovered();
            e.start = true;
            e.arrow_id = this.cameras.cameras.indexOf(this.currentPointedCamera);
            e.send();

            this.prev.x = this.mouse.x;
            this.prev.y = this.mouse.y;
        }
        this.prev.camera = hovered;
        this.prev.go = true;
    } else {
        if (this.prev.go) {
        // Log if previous was not null
            e = new BD.Event.Hovered();
            e.start = false;
            e.arrow_id = null;
            e.send();
        }
        this.prev.go = false;
    }

    document.getElementById('container').style.cursor = hovered ? "pointer" : "auto";

    if (this.cameras.mainCamera().pointerLocked)
        this.cameras.mainCamera().mousePointer.render(hovered ? MousePointer.RED : MousePointer.BLACK);

};

CameraSelecter.prototype.click = function(event) {
    var e;
    var newCamera = this.pointedCamera();

    if (newCamera !== undefined && !(newCamera instanceof Coin)) {

        e = new BD.Event.ArrowClicked();
        e.arrow_id = this.cameras.cameras.indexOf(newCamera);
        e.send();

        newCamera.check();
        this.cameras.mainCamera().moveHermite(newCamera);
        buttonManager.updateElements();

    } else if (newCamera instanceof Coin) {

        // Coin found, notify server
        e = new BD.Event.CoinClicked();
        e.coin_id = this.coins.indexOf(newCamera);
        e.send();
        newCamera.get();

    }

};

CameraSelecter.prototype.clickPointer = function(event) {
    var e;

    if (this.cameras.mainCamera().pointerLocked) {

        var newCamera = this.pointedCamera();

        if (newCamera !== undefined && !(newCamera instanceof Coin)) {

            e = new BD.Event.ArrowClicked();
            e.arrow_id = this.cameras.cameras.indexOf(newCamera);
            e.send();

            newCamera.check();
            this.cameras.mainCamera().moveHermite(newCamera);
            buttonManager.updateElements();

        } else if (newCamera instanceof Coin) {

            // Coin found, notify server
            e = new BD.Event.CoinClicked();
            e.coin_id = this.coins.indexOf(newCamera);
            e.send();
            newCamera.get();

        }
    }
};
