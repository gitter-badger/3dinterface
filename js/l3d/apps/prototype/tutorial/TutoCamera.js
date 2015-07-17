// class camera extends THREE.PerspectiveCamera
var TutoCamera = function() {
    THREE.PerspectiveCamera.apply(this, arguments);

    this.renderer = arguments[4];
    this.onWindowResize = arguments[6];
    var scene = arguments[5];
    var container_size = arguments[7];
    var coins = arguments[8];

    if (arguments[9] === undefined)
        listenerTarget = document;
    else
        listenerTarget = arguments[9];

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
    this.history = new L3D.History();

    // Set events from the document
    var self = this;

    var onKeyDown = function(event) {self.onKeyDown(event);};
    var onKeyUp = function(event) {self.onKeyUp(event);};
    var onMouseDown = function(event) {if (event.which === 1) self.onMouseDown(event); };
    var onMouseUp = function(event) {if (event.which === 1) self.onMouseUp(event); };
    var onMouseMove = function(event) {self.onMouseMove(event); };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    document.addEventListener('pointerlockchange', function(event) { self.onPointerLockChange(event); }, false);
    document.addEventListener('mozpointerlockchange', function(event) { self.onPointerLockChange(event); }, false);
    document.addEventListener('webkitpointerlockchange', function(event) { self.onPointerLockChange(event); }, false);

    document.addEventListener('mousemove', function(event) {self.onMouseMovePointer(event);}, false);

    listenerTarget.addEventListener('mousedown', function() {self.lockPointer();}, false);
    listenerTarget.addEventListener('mousedown', onMouseDown, false);
    listenerTarget.addEventListener('mousemove', onMouseMove, false);
    listenerTarget.addEventListener('mouseup', onMouseUp, false);
    listenerTarget.addEventListener('mouseout', onMouseUp, false);

    document.getElementById('lock').addEventListener('change', function(e) {
        if (self.tutorial.nextAction() === 'uncheck-lock') {
            self.tutorial.nextStep();
        }
    });

    this.collisions = true;

    // Create tutorial
    this.tutorial = new TutorialSteps(this, scene, coins, this.onWindowResize, container_size, arguments[10]);

    this.shouldLock = true;

};
TutoCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
TutoCamera.prototype.constructor = TutoCamera;

TutoCamera.prototype.lockPointer = function() {

    if (this.shouldLock) {
        this.renderer.domElement.requestPointerLock =
            this.renderer.domElement.requestPointerLock ||
            this.renderer.domElement.mozRequestPointerLock ||
            this.renderer.domElement.webkitRequestPointerLock;

        if (this.renderer.domElement.requestPointerLock) {

            this.renderer.domElement.requestPointerLock();

        }

    }

};

TutoCamera.prototype.isLocked = function() {
    var toto =
        document.pointerLockElement === this.renderer.domElement ||
        document.mozPointerLockElement === this.renderer.domElement ||
        document.webkitPointerLockElement === this.renderer.domElement;

    return toto;

};

TutoCamera.prototype.onPointerLockChange = function() {

    if (this.isLocked()) {

        // The pointer is locked : adapt the state of the camera
        this.pointerLocked = true;
        this.mousePointer.render(L3D.MousePointer.BLACK);

        this.mouse.x = this.renderer.domElement.width/2;
        this.mouse.y = this.renderer.domElement.height/2;

        // Remove start canvas
        this.startCanvas.clear();

        if (this.tutorial.nextAction() === 'lock-pointer') {
            this.tutorial.nextStep();
        }

    } else {

        this.pointerLocked = false;
        this.mousePointer.clear();

        this.theta = this.previousTheta;
        this.phi = this.previousPhi;

        this.mouseMove.x = 0;
        this.mouseMove.y = 0;

        // Draw start canvas only if should lock
        if (this.shouldLock)
            this.startCanvas.render();
        else
            this.startCanvas.clear();

        if (this.tutorial.nextAction() === 'unlock-pointer') {
            this.tutorial.nextStep();
        }

    }

};

// Update function
TutoCamera.prototype.update = function(time) {
    if (this.moving) {
        this.linearMotion(time);
    } else if (this.movingHermite) {
        this.hermiteMotion(time);
    } else {
        this.normalMotion(time);
    }
};

TutoCamera.prototype.linearMotion = function(time) {
    var position_direction = L3D.Tools.diff(this.new_position, this.position);
    var target_direction = L3D.Tools.diff(this.new_target, this.target);

    this.position.add(L3D.Tools.mul(position_direction, 0.05 * time / 20));
    this.target.add(L3D.Tools.mul(target_direction, 0.05 * time / 20));

    if (L3D.Tools.norm2(L3D.Tools.diff(this.position, this.new_position)) < 0.01 &&
        L3D.Tools.norm2(L3D.Tools.diff(this.target, this.new_target))  < 0.01) {
        this.moving = false;
    this.anglesFromVectors();
    }
};

TutoCamera.prototype.hermiteMotion = function(time) {
    var e = this.hermitePosition.eval(this.t);
    this.position.x = e.x;
    this.position.y = e.y;
    this.position.z = e.z;

    this.target = L3D.Tools.sum(this.position, this.hermiteAngles.eval(this.t));

    this.t += 0.01 * time / 20;

    if (this.t > 1) {
        this.movingHermite = false;
        this.anglesFromVectors();
    }
};

TutoCamera.prototype.normalMotion = function(time) {
    // Update angles
    if (this.motion.increasePhi)   {this.phi   += this.sensitivity; this.changed = true; }
    if (this.motion.decreasePhi)   {this.phi   -= this.sensitivity; this.changed = true; }
    if (this.motion.increaseTheta) {this.theta += this.sensitivity; this.changed = true; }
    if (this.motion.decreaseTheta) {this.theta -= this.sensitivity; this.changed = true; }

    if (this.isLocked() || this.dragging) {

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
    if (this.motion.moveForward)  {direction.add(L3D.Tools.mul(forward, speed)); this.changed = true;}
    if (this.motion.moveBackward) {direction.sub(L3D.Tools.mul(forward, speed)); this.changed = true;}
    if (this.motion.moveLeft)     {direction.add(L3D.Tools.mul(left,    speed)); this.changed = true;}
    if (this.motion.moveRight)    {direction.sub(L3D.Tools.mul(left,    speed)); this.changed = true;}

    var collide = this.isColliding(direction);
    if (this.collisions && collide) {
        var face = collide.face;
        var vertices = collide.object.geometry.vertices;
        var normal = L3D.Tools.cross(L3D.Tools.diff(vertices[face.b], vertices[face.a]), L3D.Tools.diff(vertices[face.c], vertices[face.a])).normalize();

        if (L3D.Tools.dot(normal, direction) > 0) {
            normal.multiplyScalar(-1);
        }

        normal.multiplyScalar(0.01);
        this.position.add(normal);
    } else {
        this.position.add(direction);
    }

    // Update angle
    this.target = this.position.clone();
    this.target.add(forward);
};

TutoCamera.prototype.reset = function() {
    if (this.tutorial.nextAction() === 'reset-camera') {
        this.tutorial.nextStep();
    }

    this.resetPosition();
    this.moving = false;
    this.movingHermite = false;
    (new L3D.DB.Event.ResetClicked()).send();

    this.previousTheta = this.theta;
    this.previousPhi = this.phi;
};

TutoCamera.prototype.resetPosition = function() {
    this.position.copy(this.resetElements.position);
    this.target.copy(this.resetElements.target);
    this.anglesFromVectors();
};

TutoCamera.prototype.vectorsFromAngles = function() {
    // Update direction
    this.forward.y = Math.sin(this.phi);

    var cos = Math.cos(this.phi);
    this.forward.z = cos * Math.cos(this.theta);
    this.forward.x = cos * Math.sin(this.theta);
    this.forward.normalize();

};

TutoCamera.prototype.anglesFromVectors = function() {
    var forward = L3D.Tools.diff(this.target, this.position);
    forward.normalize();

    this.phi = Math.asin(forward.y);

    // Don't know why this line works... But thanks Thierry-san and
    // Bastien because it seems to work...
    this.theta = Math.atan2(forward.x, forward.z);
};

TutoCamera.prototype.move = function(recommendation, toSave) {
    if (toSave === undefined)
        toSave = true;

    var otherCamera = recommendation.camera || recommendation;

    this.moving = true;
    this.movingHermite = false;

    this.new_target = otherCamera.target.clone();
    this.new_position = otherCamera.position.clone();
    var t = [0,1];
    var f = [this.position.clone(), this.new_position];
    var fp = [L3D.Tools.diff(this.target, this.position), L3D.Tools.diff(this.new_target, this.new_position)];
    this.hermite = new L3D.Hermite.Polynom(t,f,fp);
    this.t = 0;

    if (toSave) {
        if (this.changed) {
            this.save();
            this.changed = false;
        }
        this.history.addState({position: otherCamera.position.clone(), target: otherCamera.target.clone()});
    }
};

TutoCamera.prototype.moveHermite = function(recommendation, toSave) {
    if (this.tutorial.nextAction() === 'recommendation') {
        this.tutorial.nextStep();
    }

    if (toSave === undefined)
        toSave = true;

    var otherCamera = recommendation.camera;

    this.moving = false;
    this.movingHermite = true;
    this.t = 0;

    this.hermitePosition = new L3D.Hermite.special.Polynom(
        this.position.clone(),
        otherCamera.position.clone(),
        L3D.Tools.mul(L3D.Tools.diff(otherCamera.target, otherCamera.position).normalize(),4)
    );

    this.hermiteAngles = new L3D.Hermite.special.Polynom(
        L3D.Tools.diff(this.target, this.position),
        L3D.Tools.diff(otherCamera.target, otherCamera.position),
        new THREE.Vector3()
    );

    if (toSave) {
        if (this.changed) {
            this.save();
            this.changed = false;
        }
        this.history.addState({position: otherCamera.position.clone(), target: otherCamera.target.clone()});
    }
};

TutoCamera.prototype.isColliding = function(direction) {
    this.raycaster.set(this.position, direction.clone().normalize());
    var intersects = this.raycaster.intersectObjects(this.collidableObjects, true);

    for (var i in intersects) {
        if (intersects[i].distance < L3D.Tools.norm(direction) + this.speed * 300 &&
            intersects[i].object.raycastable) {
            return intersects[i];
        }
    }
};

// Look function
TutoCamera.prototype.look = function() {
    this.lookAt(this.target);
};

TutoCamera.prototype.addToScene = function(scene) {
    scene.add(this);
};

TutoCamera.prototype.onKeyEvent = function(event, toSet) {
    // Create copy of state
    var motionJsonCopy = JSON.stringify(this.motion);
    var moved;

    if (this.allowed.keyboardTranslate) {
        moved = true;

        switch ( event.keyCode ) {
            // Azerty keyboards
            case 38: case 90:  this.motion.moveForward   = toSet; break; // up / z
            case 37: case 81:  this.motion.moveLeft      = toSet; break; // left / q
            case 40: case 83:  this.motion.moveBackward  = toSet; break; // down / s
            case 39: case 68:  this.motion.moveRight     = toSet; break; // right / d

            // Qwerty keyboards
            case 38: case 87:  this.motion.moveForward   = toSet; break; // up / w
            case 37: case 65:  this.motion.moveLeft      = toSet; break; // left / a
            case 40: case 83:  this.motion.moveBackward  = toSet; break; // down / s
            case 39: case 68:  this.motion.moveRight     = toSet; break; // right / d

            case 32: this.motion.boost = toSet; moved = false; break;
            default: moved = false; break;
        }

        if (moved && this.tutorial.nextAction() === 'translate-keyboard' && !toSet) {
            this.tutorial.nextStep();
        }
    }

    if (this.allowed.keyboardRotate) {
        moved = true;

        switch ( event.keyCode ) {
            case 73: case 104: this.motion.increasePhi   = toSet; break; // 8 Up for angle
            case 75: case 98:  this.motion.decreasePhi   = toSet; break; // 2 Down for angle
            case 74: case 100: this.motion.increaseTheta = toSet; break; // 4 Left for angle
            case 76: case 102: this.motion.decreaseTheta = toSet; break; // 6 Right for angle

            default: moved = false; break;
        }

        if (moved && this.tutorial.nextAction() === 'rotate-keyboard' && !toSet) {
            this.tutorial.nextStep();
        }
    }

    if (motionJsonCopy != JSON.stringify(this.motion)) {
        // Log any change
        var e = new L3D.DB.Event.KeyboardEvent();
        e.camera = this;
        e.send();
    }
};

TutoCamera.prototype.onKeyDown = function(event) {
    this.onKeyEvent(event, true);
};

TutoCamera.prototype.onKeyUp = function(event) {
    this.onKeyEvent(event, false);
};

TutoCamera.prototype.onMouseDown = function(event) {
    this.mouse.x = ( ( event.clientX - this.renderer.domElement.offsetLeft ) / this.renderer.domElement.width ) * 2 - 1;
    this.mouse.y = - ( ( event.clientY - this.renderer.domElement.offsetTop ) / this.renderer.domElement.height ) * 2 + 1;

    if (this.allowed.mouseRotate) {
        this.dragging = true;
        this.mouseMoved = false;
    }
};

TutoCamera.prototype.onMouseMove = function(event) {
    if (!this.shouldLock && this.dragging) {
        this.previousTheta = this.theta;
        this.previousPhi = this.phi;

        var mouse = {x: this.mouse.x, y: this.mouse.y};
        this.mouse.x = ( ( event.clientX - this.renderer.domElement.offsetLeft ) / this.renderer.domElement.width ) * 2 - 1;
        this.mouse.y = - ( ( event.clientY - this.renderer.domElement.offsetTop ) / this.renderer.domElement.height ) * 2 + 1;

        this.mouseMove.x = this.mouse.x - mouse.x;
        this.mouseMove.y = this.mouse.y - mouse.y;
        this.mouseMoved = true;

        if (this.tutorial.nextAction() === 'rotate-mouse') {
            this.tutorial.nextStep();
        }
    }
};

TutoCamera.prototype.onMouseMovePointer = function(e) {

    if (this.isLocked()) {

        // Backup theta and phi
        this.previousTheta = this.theta;
        this.previousPhi = this.phi;

        this.mouseMove.x = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        this.mouseMove.y = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

        this.mouseMove.x *= -(this.sensitivity/10);
        this.mouseMove.y *=  (this.sensitivity/10);

        this.mouseMoved = true;

    }

};

TutoCamera.prototype.onMouseUp = function(event) {
    this.onMouseMove(event);

    // Send log to DB
    if (this.dragging && this.mouseMoved && !this.moving && !this.movingHermite) {
        var e = new L3D.DB.Event.KeyboardEvent();
        e.camera = this;
        e.send();
    }

    this.dragging = false;
};

TutoCamera.prototype.log = function() {
    console.log("createCamera(\nnew THREE.Vector3(" + this.position.x + "," +  this.position.y + ',' + this.position.z + '),\n' +
                "new THREE.Vector3(" + this.target.x + "," +  this.target.y + ',' + this.target.z + ')\n)');
};

TutoCamera.prototype.save = function() {
    var backup = {};
    backup.position = this.position.clone();
    backup.target = this.target.clone();
    this.history.addState(backup);
};

TutoCamera.prototype.undo = function() {
    var move = this.history.undo();
    if (move !== undefined) {
        var event = new L3D.DB.Event.PreviousNextClicked();
        event.previous = true;
        event.camera = move;
        event.send();

        this.move(move, false);
    }
};

TutoCamera.prototype.redo = function() {
    var move = this.history.redo();
    if (move !== undefined) {
        var event = new L3D.DB.Event.PreviousNextClicked();
        event.previous = false;
        event.camera = move;
        event.send();

        this.move(move, false);
    }
};

TutoCamera.prototype.undoable = function() {
    return this.history.undoable();
};

TutoCamera.prototype.redoable = function() {
    return this.history.redoable();
};
