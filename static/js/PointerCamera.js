// class camera extends THREE.PerspectiveCamera
var PointerCamera = function() {
    THREE.PerspectiveCamera.apply(this, arguments);

    if (arguments[4] === undefined)
        listenerTarget = document;
    else
        listenerTarget = arguments[4];

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
    this.target = new THREE.Vector3(0,1,0);

    // Stuff for events
    this.moveForward = false;
    this.moveBackward = false;
    this.moveRight = false;
    this.moveLeft = false;

    this.sensitivity = 0.05;
    this.speed = 1;

    // Raycaster for collisions
    this.raycaster = new THREE.Raycaster();

    // Set events from the document
    var self = this;
    var onKeyDown = function(event) {self.onKeyDown(event);};
    var onKeyUp = function(event) {self.onKeyUp(event);};
    var onMouseDown = function(event) {self.onMouseDown(event); };
    var onMouseMove = function(event) {self.onMouseMove(event); };
    var onMouseUp = function(event) {self.onMouseUp(event); };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    listenerTarget.addEventListener('mousedown', function(event) { if (event.which == 1) onMouseDown(event);}, false);
    listenerTarget.addEventListener('mousemove', function(event) { if (event.which == 1) onMouseMove(event);}, false);
    listenerTarget.addEventListener('mouseup', onMouseUp, false);
    // listenerTarget.addEventListener('mouseup', function() { console.log("mouseup");}, false);
    // listenerTarget.addEventListener('mouseout', onMouseUp, false);

    this.collisions = true;
}
PointerCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
PointerCamera.prototype.constructor = PointerCamera;

// Update function
PointerCamera.prototype.update = function() {
    if (this.moving) {
        // Linear motion
        var position_direction = Tools.diff(this.new_position, this.position);
        var target_direction = Tools.diff(this.new_target, this.target);

        this.position.add(Tools.mul(position_direction, 0.05));
        this.target.add(Tools.mul(target_direction, 0.05));

        if (Tools.norm2(Tools.diff(this.position, this.new_position)) < 0.01 &&
            Tools.norm2(Tools.diff(this.target, this.new_target))  < 0.01) {
            this.moving = false;
            this.anglesFromVectors();
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

        // Compute vectors (position and target)
        this.vectorsFromAngles();

        // Update with events
        var delta = 0.1;
        var forward = this.forward.clone();
        forward.multiplyScalar(400.0 * delta);
        var left = this.up.clone();
        left.cross(forward);
        left.normalize();
        left.multiplyScalar(400.0 * delta);

        // Move only if no collisions
        var speed = this.speed;
        var direction = new THREE.Vector3();

        if (this.boost) speed *= 10;
        if (this.moveForward)  direction.add(Tools.mul(forward, speed));
        if (this.moveBackward) direction.sub(Tools.mul(forward, speed));
        if (this.moveLeft)     direction.add(Tools.mul(left,    speed));
        if (this.moveRight)    direction.sub(Tools.mul(left,    speed));

        if (!this.collisions || !this.isColliding(direction)) {
            this.position.add(direction);
        }

        // Update angle
        this.target = this.position.clone();
        this.target.add(forward);
    }
}

PointerCamera.prototype.reset = function() {
    this.position.copy(new THREE.Vector3(-8.849933489419644, 9.050627639459208, 0.6192960680432451));
    this.target.copy(new THREE.Vector3(17.945323228767702, -15.156828589982375, -16.585740412769756));
    this.anglesFromVectors();
}

PointerCamera.prototype.vectorsFromAngles = function() {
    // Update direction
    this.forward.y = Math.sin(this.phi);

    var cos = Math.cos(this.phi);
    this.forward.z = cos * Math.cos(this.theta);
    this.forward.x = cos * Math.sin(this.theta);
    this.forward.normalize();

}

PointerCamera.prototype.anglesFromVectors = function() {
    // Update phi and theta so that return to reality does not hurt
    var forward = Tools.diff(this.target, this.position);
    forward.normalize();

    this.phi = Math.asin(forward.y);

    // Don't know why this line works... But thanks Thierry-san and
    // Bastien because it seems to work...
    this.theta = Math.atan2(forward.x, forward.z);
}

PointerCamera.prototype.move = function(otherCamera) {
    this.moving = true;
    this.new_target = otherCamera.target.clone();
    this.new_position = otherCamera.position.clone();
    var t = [0,1];
    var f = [this.position.clone(), this.new_position];
    var fp = [Tools.diff(this.target, this.position), Tools.diff(this.new_target, this.new_position)];
    this.hermite = new Hermite.Polynom(t,f,fp);
    this.t = 0;
}

PointerCamera.prototype.isColliding = function(direction) {
    this.raycaster.set(this.position, direction.clone().normalize());
    var intersects = this.raycaster.intersectObjects(this.collidableObjects, true);

    for (var i in intersects) {
        if (intersects[i].distance < 0.1) {
            return true;
        }
    }

    return false;
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
        case 32:          this.boost = toSet; break;

        // Qwerty keyboards
        // case 38: case 87: this.moveForward  = toSet; break; // up / w
        // case 37: case 65: this.moveLeft     = toSet; break; // left / a
        // case 40: case 83: this.moveBackward = toSet; break; // down / s
        // case 39: case 68: this.moveRight    = toSet; break; // right / d

        case 73: case 104: this.increasePhi   = toSet; break; // 8 Up for angle
        case 75: case 98:  this.decreasePhi   = toSet; break; // 2 Down for angle
        case 74: case 100: this.increaseTheta = toSet; break; // 4 Left for angle
        case 76: case 102: this.decreaseTheta = toSet; break; // 6 Right for angle

        case 13: if (toSet) this.log(); break;
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

PointerCamera.prototype.log = function() {
    console.log("(" + this.position.x + "," +  this.position.y + ',' + this.position.z + ')');
    console.log("(" + this.target.x + "," +  this.target.y + ',' + this.target.z + ')');
}

PointerCamera.prototype.save = function() {
    this.backup = {};
    this.backup.position = this.position.clone();
    this.backup.target = this.target.clone();
}

PointerCamera.prototype.load = function() {
    this.move(this.backup);
}

// Static members
PointerCamera.DISTANCE_X = 1000;
PointerCamera.DISTANCE_Z = 300;
