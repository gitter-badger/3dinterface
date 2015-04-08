// class camera extends THREE.PerspectiveCamera
var PointerCamera = function() {
    THREE.PerspectiveCamera.apply(this, arguments);

    // Set Position
    this.theta = Math.PI;
    this.phi = Math.PI;

    // this.keyboard = undefined;
    this.moving = false;

    this.dragging = false;
    this.mouse = {x: 0, y: 0};
    this.mouseMove = {x: 0, y: 0};


    // Stuff for rendering
    this.position = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.left = new THREE.Vector3();
    this.up = new THREE.Vector3(0,0,1);
    this.target = new THREE.Vector3(0,1,0);

    // Stuff for events
    this.moveForward = false;
    this.moveBackward = false;
    this.moveRight = false;
    this.moveLeft = false;

    this.sensitivity = 0.05;
    this.speed = 1;

    // Set events from the document
    var self = this;
    var onKeyDown = function(event) {self.onKeyDown(event);};
    var onKeyUp = function(event) {self.onKeyUp(event);};
    var onMouseDown = function(event) {self.onMouseDown(event); };
    var onMouseMove = function(event) {self.onMouseMove(event); };
    var onMouseUp = function(event) {self.onMouseUp(event); };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);
}
PointerCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
PointerCamera.prototype.constructor = PointerCamera;

// Update function
PointerCamera.prototype.update = function() {
    if (this.moving) {
        var position_direction = Tools.diff(this.new_position, this.position);
        var target_direction = Tools.diff(this.new_target, this.target);

        this.position.add(Tools.mul(position_direction, 0.05));
        this.target.add(Tools.mul(target_direction, 0.05));

        if (Tools.norm2(Tools.diff(this.position, this.new_position)) < 1 &&
            Tools.norm2(Tools.diff(this.target, this.new_target))  < 1){
            // this.position = this.new_position.clone();
            // this.target = this.new_target.clone();
            this.moving = false;

            // Update phi and theta so that return to reality does not hurt
            var forward = Tools.diff(this.target, this.position);
            forward.normalize();

            this.phi = Math.asin(forward.z);

            // Don't know why this line works... But thanks Thierry-san because
            // it seems to work...
            this.theta = Math.atan(forward.y / forward.x) + Math.PI;

        }

    } else {
        // Update angles
        if (this.increasePhi)   this.phi   += this.sensitivity;
        if (this.decreasePhi)   this.phi   -= this.sensitivity;
        if (this.increaseTheta) this.theta += this.sensitivity;
        if (this.decreaseTheta) this.theta -= this.sensitivity;

        if (this.dragging) {
            this.theta += this.mouseMove.x;
            this.phi   -= this.mouseMove.y;

            this.mouseMove.x = 0;
            this.mouseMove.y = 0;
        }

        // Clamp phi and theta
        this.phi = Math.min(Math.max(-(Math.PI/2-0.1),this.phi), Math.PI/2-0.1);
        this.theta = ((this.theta - Math.PI) % (2*Math.PI)) + Math.PI;

        var delta = 0.1;

        // Update direction
        this.forward.z = Math.sin(this.phi);

        var cos = Math.cos(this.phi);
        this.forward.x = cos * Math.cos(this.theta);
        this.forward.y = cos * Math.sin(this.theta);
        this.forward.normalize();

        // Update
        var forward = this.forward.clone();
        forward.multiplyScalar(400.0 * delta);
        var left = this.up.clone();
        left.cross(forward);
        left.normalize();
        left.multiplyScalar(400.0 * delta);

        if (this.moveForward)  this.position.add(Tools.mul(forward, this.speed));
        if (this.moveBackward) this.position.sub(Tools.mul(forward, this.speed));
        if (this.moveLeft)     this.position.add(Tools.mul(left,    this.speed));
        if (this.moveRight)    this.position.sub(Tools.mul(left,    this.speed));

        this.target = this.position.clone();
        this.target.add(forward);
    }


}

PointerCamera.prototype.move = function(otherCamera) {
    this.moving = true;
    this.new_target = otherCamera.target.clone();
    this.new_position = otherCamera.position.clone();
}

// Look function
PointerCamera.prototype.look = function() {
    this.lookAt(this.target);
}

PointerCamera.prototype.addToScene = function(scene) {
    scene.add(this);
}

PointerCamera.prototype.onKeyEvent = function(event, toSet) {
    switch ( event.keyCode ) {
        // Azerty keyboards
        case 38: case 90: this.moveForward  = toSet; break; // up / z
        case 37: case 81: this.moveLeft     = toSet; break; // left / q
        case 40: case 83: this.moveBackward = toSet; break; // down / s
        case 39: case 68: this.moveRight    = toSet; break; // right / d

        // Qwerty keyboards
        // case 38: case 87: this.moveForward  = toSet; break; // up / w
        // case 37: case 65: this.moveLeft     = toSet; break; // left / a
        // case 40: case 83: this.moveBackward = toSet; break; // down / s
        // case 39: case 68: this.moveRight    = toSet; break; // right / d

        case 104: this.increasePhi   = toSet; break; // 8 Up for angle
        case 98:  this.decreasePhi   = toSet; break; // 2 Down for angle
        case 100: this.increaseTheta = toSet; break; // 4 Left for angle
        case 102: this.decreaseTheta = toSet; break; // 6 Right for angle
    }
}

PointerCamera.prototype.onKeyDown = function(event) {
    this.onKeyEvent(event, true);
}

PointerCamera.prototype.onKeyUp = function(event) {
    this.onKeyEvent(event, false);
}

PointerCamera.prototype.onMouseDown = function(event) {
    this.mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
    this.mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;

    this.dragging = true;
}

PointerCamera.prototype.onMouseMove = function(event) {
    if (this.dragging) {
        var mouse = {x: this.mouse.x, y: this.mouse.y};
        this.mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
        this.mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;

        this.mouseMove.x = this.mouse.x - mouse.x;
        this.mouseMove.y = this.mouse.y - mouse.y;
    }
}

PointerCamera.prototype.onMouseUp = function(event) {
    this.onMouseMove(event);
    this.dragging = false;
}

// Static members
PointerCamera.DISTANCE_X = 1000;
PointerCamera.DISTANCE_Z = 300;
