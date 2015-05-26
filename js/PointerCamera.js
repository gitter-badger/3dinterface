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
    this.motion = {};

    this.sensitivity = 0.05;
    this.speed = 1;

    // Raycaster for collisions
    this.raycaster = new THREE.Raycaster();

    // Create history object
    this.history = new History();

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

    this.resetElements = resetBobombElements();
}
PointerCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
PointerCamera.prototype.constructor = PointerCamera;

// Update function
PointerCamera.prototype.update = function(time) {
    if (this.moving) {
        this.linearMotion(time);
    } else if (this.movingHermite) {
        this.hermiteMotion(time);
    } else {
        this.normalMotion(time);
    }
}

PointerCamera.prototype.linearMotion = function(time) {
    var position_direction = Tools.diff(this.new_position, this.position);
    var target_direction = Tools.diff(this.new_target, this.target);

    this.position.add(Tools.mul(position_direction, 0.05 * time / 20));
    this.target.add(Tools.mul(target_direction, 0.05 * time / 20));

    if (Tools.norm2(Tools.diff(this.position, this.new_position)) < 0.01 &&
        Tools.norm2(Tools.diff(this.target, this.new_target))  < 0.01) {
        this.moving = false;
    this.anglesFromVectors();
    }
}

PointerCamera.prototype.hermiteMotion = function(time) {
    var eval = this.hermitePosition.eval(this.t);
    this.position.x = eval.x;
    this.position.y = eval.y;
    this.position.z = eval.z;

    this.target = Tools.sum(this.position, this.hermiteAngles.eval(this.t));

    this.t += 0.01 * time / 20;

    if (this.t > 1) {
        this.movingHermite = false;
        this.anglesFromVectors();
    }
}

PointerCamera.prototype.normalMotion = function(time) {
    // Update angles
    if (this.motion.increasePhi)   {this.phi   += this.sensitivity; this.changed = true; }
    if (this.motion.decreasePhi)   {this.phi   -= this.sensitivity; this.changed = true; }
    if (this.motion.increaseTheta) {this.theta += this.sensitivity; this.changed = true; }
    if (this.motion.decreaseTheta) {this.theta -= this.sensitivity; this.changed = true; }

    if (this.dragging) {
        this.theta += this.mouseMove.x;
        this.phi   -= this.mouseMove.y;

        this.mouseMove.x = 0;
        this.mouseMove.y = 0;

        this.changed = true;
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
    var speed = this.speed * time / 20;
    var direction = new THREE.Vector3();

    if (this.motion.boost) speed *= 10;
    if (this.motion.moveForward)  {direction.add(Tools.mul(forward, speed)); this.changed = true;}
    if (this.motion.moveBackward) {direction.sub(Tools.mul(forward, speed)); this.changed = true;}
    if (this.motion.moveLeft)     {direction.add(Tools.mul(left,    speed)); this.changed = true;}
    if (this.motion.moveRight)    {direction.sub(Tools.mul(left,    speed)); this.changed = true;}

    if (!this.collisions || !this.isColliding(direction)) {
        this.position.add(direction);
    }

    // Update angle
    this.target = this.position.clone();
    this.target.add(forward);
}

PointerCamera.prototype.reset = function() {
    this.resetPosition();
    this.moving = false;
    this.movingHermite = false;
    (new BD.Event.ResetClicked()).send();
}

PointerCamera.prototype.resetPosition = function() {
    this.position.copy(this.resetElements.position);
    this.target.copy(this.resetElements.target);
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
    var forward = Tools.diff(this.target, this.position);
    forward.normalize();

    this.phi = Math.asin(forward.y);

    // Don't know why this line works... But thanks Thierry-san and
    // Bastien because it seems to work...
    this.theta = Math.atan2(forward.x, forward.z);
}

PointerCamera.prototype.move = function(otherCamera, toSave) {
    if (toSave === undefined)
        toSave = true;

    this.moving = true;
    this.new_target = otherCamera.target.clone();
    this.new_position = otherCamera.position.clone();
    var t = [0,1];
    var f = [this.position.clone(), this.new_position];
    var fp = [Tools.diff(this.target, this.position), Tools.diff(this.new_target, this.new_position)];
    this.hermite = new Hermite.Polynom(t,f,fp);
    this.t = 0;

    if (toSave) {
        if (this.changed) {
            this.save();
            this.changed = false;
        }
        this.history.addState({position: otherCamera.position.clone(), target: otherCamera.target.clone()});
    }
}

PointerCamera.prototype.moveHermite = function(otherCamera, toSave) {
    if (toSave === undefined)
        toSave = true;

    this.movingHermite = true;
    this.t = 0;

    this.hermitePosition = new Hermite.special.Polynom(
        this.position.clone(),
        otherCamera.position.clone(),
        Tools.mul(Tools.diff(otherCamera.target, otherCamera.position).normalize(),4)
    );

    this.hermiteAngles = new Hermite.special.Polynom(
        Tools.diff(this.target, this.position),
        Tools.diff(otherCamera.target, otherCamera.position),
        new THREE.Vector3()
    );

    if (toSave) {
        if (this.changed) {
            this.save();
            this.changed = false;
        }
        this.history.addState({position: otherCamera.position.clone(), target: otherCamera.target.clone()});
    }
}

PointerCamera.prototype.isColliding = function(direction) {
    this.raycaster.set(this.position, direction.clone().normalize());
    var intersects = this.raycaster.intersectObjects(this.collidableObjects, true);

    for (var i in intersects) {
        if (intersects[i].distance < 100*this.speed) {
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
    // Create copy of state
    var motionJsonCopy = JSON.stringify(this.motion);

    switch ( event.keyCode ) {
        // Azerty keyboards
        case 38: case 90:  this.motion.moveForward   = toSet; break; // up / z
        case 37: case 81:  this.motion.moveLeft      = toSet; break; // left / q
        case 40: case 83:  this.motion.moveBackward  = toSet; break; // down / s
        case 39: case 68:  this.motion.moveRight     = toSet; break; // right / d
        case 32:           this.motion.boost         = toSet; break;

        // Qwerty keyboards
        case 38: case 87:  this.motion.moveForward   = toSet; break; // up / w
        case 37: case 65:  this.motion.moveLeft      = toSet; break; // left / a
        case 40: case 83:  this.motion.moveBackward  = toSet; break; // down / s
        case 39: case 68:  this.motion.moveRight     = toSet; break; // right / d

        case 73: case 104: this.motion.increasePhi   = toSet; break; // 8 Up for angle
        case 75: case 98:  this.motion.decreasePhi   = toSet; break; // 2 Down for angle
        case 74: case 100: this.motion.increaseTheta = toSet; break; // 4 Left for angle
        case 76: case 102: this.motion.decreaseTheta = toSet; break; // 6 Right for angle

        case 13: if (toSet) this.log(); break;
    }
    if (motionJsonCopy != JSON.stringify(this.motion)) {
        // Log any change
        var event = new BD.Event.KeyboardEvent();
        event.camera = this;
        event.send();
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
    this.mouseMoved = false;
}

PointerCamera.prototype.onMouseMove = function(event) {
    if (this.dragging) {
        var mouse = {x: this.mouse.x, y: this.mouse.y};
        this.mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
        this.mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;

        this.mouseMove.x = this.mouse.x - mouse.x;
        this.mouseMove.y = this.mouse.y - mouse.y;
        this.mouseMoved = true;
    }
}

PointerCamera.prototype.onMouseUp = function(event) {
    this.onMouseMove(event);

    // Send log to DB
    if (this.dragging && this.mouseMoved && !this.moving && !this.movingHermite) {
        var event = new BD.Event.KeyboardEvent();
        event.camera = this;
        event.send();
    }

    this.dragging = false;
}

PointerCamera.prototype.log = function() {
    console.log("createCamera(\nnew THREE.Vector3(" + this.position.x + "," +  this.position.y + ',' + this.position.z + '),\n'
     + "new THREE.Vector3(" + this.target.x + "," +  this.target.y + ',' + this.target.z + ')\n)');
}

PointerCamera.prototype.save = function() {
    var backup = {};
    backup.position = this.position.clone();
    backup.target = this.target.clone();
    this.history.addState(backup);
}

PointerCamera.prototype.undo = function() {
    var move = this.history.undo();
    if (move !== undefined) {
        var event = new BD.Event.PreviousNextClicked();
        event.previous = true;
        event.camera = move;
        event.send();

        this.move(move, false);
    }
}

PointerCamera.prototype.redo = function() {
    var move = this.history.redo();
    if (move !== undefined) {
        var event = new BD.Event.PreviousNextClicked();
        event.previous = false;
        event.camera = move;
        event.send();

        this.move(move, false);
    }
}

PointerCamera.prototype.undoable = function() {
    return this.history.undoable();
}

PointerCamera.prototype.redoable = function() {
    return this.history.redoable();
}

var History = function() {
    this.states = new Array();
    this.index = -1;
    this.size = 0;
    console.log('New state ' + this.index + ' / ' + this.size);
}

History.prototype.addState = function(state) {
    ++this.index;
    this.size = this.index + 1;
    this.states[this.size-1] = state;
}

History.prototype.undo = function() {
    if (this.undoable()) {
        this.index--;
        return this.currentState();
    }
}

History.prototype.redo = function() {
    if (this.redoable()) {
        this.index++;
        return this.currentState();
    }
}

History.prototype.undoable = function() {
    return this.index > 0;
}

History.prototype.redoable = function() {
    return this.index < this.size - 1;
}

History.prototype.currentState = function() {
    return this.states[this.index];
}
