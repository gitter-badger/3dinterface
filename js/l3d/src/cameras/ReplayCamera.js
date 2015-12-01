// class camera extends THREE.PerspectiveCamera
L3D.ReplayCamera = function() {
    THREE.PerspectiveCamera.apply(this, arguments);

    this.coins = arguments[4];

    this.started = false;
    this.counter = 0;

    this.position = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.newPosition = new THREE.Vector3();
    this.newTarget = new THREE.Vector3();

    this.data = arguments[5];
    this.callback = arguments[6];

    this.started = true;
    this.path = this.data.events;

    // Set Position
    this.theta = Math.PI;
    this.phi = Math.PI;

    this.shouldRecover = false;

    this.recommendationClicked = null;

    this.isArrow = false;

    this.totalTime = 0;

    this.quittingTime = Infinity;

};
L3D.ReplayCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
L3D.ReplayCamera.prototype.constructor = L3D.ReplayCamera;

L3D.ReplayCamera.prototype.look = function() {
    this.lookAt(this.target);
};

L3D.ReplayCamera.prototype.start = function() {
    this.counter = 0;
    this.started = true;
    this.nextEvent();
};

// Update function
L3D.ReplayCamera.prototype.update = function(time) {
    this.totalTime += time;
    if (this.totalTime > this.quittingTime) {
        process.exit(0);
    }
    if (this.started) {
        if (this.event.type == 'camera') {
            this.cameraMotion(time);
        } else if (this.event.type == 'previousnext') {
            this.linearMotion(time / 5);
        } else if (this.event.type == 'arrow') {
            this.hermiteMotion(time);
        }
        // } else if (this.event.type == 'coin') {
        //     // Nothing to do
        // } else if (this.event.type == 'reset') {
        //     // Nothing to do
        // }
    }

    return this.finished;
};

L3D.ReplayCamera.prototype.linearMotion = function(time) {
    var tmp = L3D.Tools.sum(L3D.Tools.mul(this.oldPosition, 1-this.t), L3D.Tools.mul(this.newPosition, this.t));
    this.position.copy(tmp);
    this.t += 0.1 * time / 20;

    if (this.t > 1) {
        this.nextEvent();
    }
};

L3D.ReplayCamera.prototype.cameraMotion = function(time) {

    var tmp = L3D.Tools.sum(L3D.Tools.mul(this.oldPosition, 1-this.t), L3D.Tools.mul(this.newPosition, this.t));
    this.position.copy(tmp);
    this.target = L3D.Tools.sum(L3D.Tools.mul(this.oldTarget, 1-this.t), L3D.Tools.mul(this.newTarget, this.t));
    this.t += this.recovering ? 0.01 : 1 / (((new Date(this.path[this.counter].time)).getTime() - (new Date(this.path[this.counter-1].time)).getTime()) / 20);

    if (this.t > 1) {
        this.recommendationClicked = null;
        if (typeof this.recoverCallback === 'function') {
            this.recoverCallback();
            this.recoverCallback = null;
        } else {
            this.nextEvent();
        }

    }
};

L3D.ReplayCamera.prototype.hermiteMotion = function(time) {
    var e = this.hermitePosition.eval(this.t);
    this.position.copy(e);

    this.target = L3D.Tools.sum(this.position, this.hermiteAngles.eval(this.t));

    this.t += 0.01 * time / 20;

    if (this.t > 1) {
        this.recommendationClicked = null;
        this.nextEvent();
    }
};

L3D.ReplayCamera.prototype.nextEvent = function() {

    var self = this;

    if (self.isArrow) {
        self.isArrow = false;
        if (typeof self.logReco === 'function') {
            var info = self.logReco(false, self.totalTime);
            require('fs').appendFileSync(info.path, info.value);
        }
        process.stderr.write('\033[31mArrowclicked finished !\033[0m\n');
    }

    this.counter++;

    // Finished
    if (this.counter >= this.path.length) {
        this.started = false;
        this.finished = true;
        // console.log('The replay is finished');
        if (typeof this.callback === 'function') {
            this.callback();
        }
        return;
    }

    this.event = this.path[this.counter];
    // console.log(this.event.type);

    if (this.event.type == 'camera') {
        this.move(this.event);
    } else if (this.event.type == 'coin') {
        // Get the coin with the same id of event
        for (var i = 0; i < this.coins.length; i++) {
            if (this.coins[i].id === this.event.id)
                this.coins[i].get();
        }
        this.nextEvent();
        // Wait a little before launching nextEvent
        // (function(self) {
        //     setTimeout(function() {
        //         self.nextEvent();
        //     },500);
        // })(this);
    } else if (this.event.type == 'arrow') {
        self.isArrow = true;
        if (typeof self.logReco === 'function') {
            var info = self.logReco(true, self.totalTime);
            require('fs').appendFileSync(info.path, info.value);
        }
        process.stderr.write('\033[33mArrowclicked ! ' + JSON.stringify(self.cameras[self.event.id].camera.position) + '\033[0m\n');
        if (self.quittingTime === Infinity)
            self.quittingTime = self.totalTime + 6000;
        if (this.shouldRecover) {
            (function(self, tmp) {
                self.event.type = 'camera';
                self.recovering = true;
                self.move({
                    position: self.position.clone(),
                    target: self.cameras[self.event.id].camera.position.clone()
                }, function() {
                    self.recovering = false;
                    self.event.type = 'arrow';
                    self.moveReco(tmp);
                });
            })(this, this.event.id);
        } else {
            this.moveReco(this.event.id);
        }
    } else if (this.event.type == 'reset') {
        this.reset();
        this.nextEvent();
        //(function (self) {
        //    setTimeout(function() {
        //        self.nextEvent();
        //    },500);
        //})(this);
    } else if (this.event.type == 'previousnext') {
        this.move(this.event);
    } else {
        // Ignore other events
        this.nextEvent();
    }
};

L3D.ReplayCamera.prototype.reset = function() {
    this.resetPosition();
    this.moving = false;
    this.movingHermite = false;
};

L3D.ReplayCamera.prototype.resetPosition = function() {
    this.position.copy(this.resetElements.position);
    this.target.copy(this.resetElements.target);
    this.anglesFromVectors();
};

L3D.ReplayCamera.prototype.vectorsFromAngles = function() {
    // Update direction
    this.forward.y = Math.sin(this.phi);

    var cos = Math.cos(this.phi);
    this.forward.z = cos * Math.cos(this.theta);
    this.forward.x = cos * Math.sin(this.theta);
    this.forward.normalize();

};

L3D.ReplayCamera.prototype.anglesFromVectors = function() {
    // Update phi and theta so that return to reality does not hurt
    var forward = L3D.Tools.diff(this.target, this.position);
    forward.normalize();

    this.phi = Math.asin(forward.y);

    // Don't know why this line works... But thanks Thierry-san and
    // Bastien because it seems to work...
    this.theta = Math.atan2(forward.x, forward.z);
};

L3D.ReplayCamera.prototype.move = function(recommendation, callback) {

    if (typeof callback === 'function') {

        this.recoverCallback = callback;

    }

    var otherCamera = recommendation.camera || recommendation;

    this.moving = true;
    this.oldTarget =   this.target.clone();
    this.oldPosition = this.position.clone();
    this.newTarget =   new THREE.Vector3(otherCamera.target.x, otherCamera.target.y, otherCamera.target.z);
    this.newPosition = new THREE.Vector3(otherCamera.position.x, otherCamera.position.y, otherCamera.position.z);

    this.t = 0;

};

L3D.ReplayCamera.prototype.moveHermite = function(recommendation) {

    if (this.shouldRecover === false) {
        this.shouldRecover = true;
    }

    var otherCamera = recommendation.camera || recommendation;

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
};

L3D.ReplayCamera.prototype.moveReco = function(recommendationId) {

    this.recommendationClicked = recommendationId;

    // process.stderr.write('Moving to ' + JSON.stringify(this.cameras[recommendationId].camera.position) + '\n');
    this.moveHermite(this.cameras[recommendationId]);

};

L3D.ReplayCamera.prototype.save = function() {};

/**
 * Creates a list containing all the elements to send to the server to stream visible part
 * @return {Array} A list containing <ol start="0">
 * <li>the position of the camera</li>
 * <li>the target of the camera</li>
 * <li>and planes defining the frustum of the camera (a,b,c, and d from ax+by+cz+d=0)</li>
 * </ol>
 */
L3D.ReplayCamera.prototype.toList = function() {

    var camera = this; // (this.recommendationClicked === null ? this : this.cameras[this.recommendationClicked].camera);

    camera.updateMatrix();
    camera.updateMatrixWorld();

    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    var frustum = new THREE.Frustum();

    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

    var ret =
        [[camera.position.x, camera.position.y, camera.position.z],
         [camera.target.x,   camera.target.y,   camera.target.z],
         this.recommendationClicked
        ];

    for (var i = 0; i < frustum.planes.length; i++) {

        var p = frustum.planes[i];

        ret.push([
            p.normal.x, p.normal.y, p.normal.z, p.constant
        ]);

    }

    return ret;
};
