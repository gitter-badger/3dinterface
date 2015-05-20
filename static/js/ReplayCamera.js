// class camera extends THREE.PerspectiveCamera
var ReplayCamera = function() {
    THREE.PerspectiveCamera.apply(this, arguments);

    this.started = false;
    this.counter = 0;

    this.position = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.new_position = new THREE.Vector3();
    this.new_target = new THREE.Vector3();

    var id = params.get.id;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/prototype/replay_info/" + id, true);

    (function(self) {
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                self.path = JSON.parse(xhr.responseText);
                self.reset();
                self.started = true;
                self.nextEvent();
            }
        }
    })(this);
    xhr.send();

    // Set Position
    this.theta = Math.PI;
    this.phi = Math.PI;


}
ReplayCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
ReplayCamera.prototype.constructor = ReplayCamera;

ReplayCamera.prototype.look = function() {
    this.lookAt(this.target);
}

// Update function
ReplayCamera.prototype.update = function(time) {
    if (this.started) {
        if (this.event.type == 'camera') {
            this.linearMotion(time);
        } else if (this.event.type == 'arrow') {
            this.hermiteMotion(time);
        } else if (this.event.type == 'coin') {
            // Nothing to do
        } else if (this.event.type == 'reset') {
        }
    }
}

ReplayCamera.prototype.linearMotion = function(time) {
    var tmp = Tools.sum(Tools.mul(this.old_position, 1-this.t), Tools.mul(this.new_position, this.t));
    this.position.x = tmp.x;
    this.position.y = tmp.y;
    this.position.z = tmp.z;
    this.target = Tools.sum(Tools.mul(this.old_target, 1-this.t), Tools.mul(this.new_target, this.t));
    this.t += 0.1 * time / 20;

    if (this.t > 1) {
        this.nextEvent();
    }
}

ReplayCamera.prototype.hermiteMotion = function(time) {
    var eval = this.hermitePosition.eval(this.t);
    this.position.x = eval.x;
    this.position.y = eval.y;
    this.position.z = eval.z;

    this.target = Tools.sum(this.position, this.hermiteAngles.eval(this.t));

    this.t += 0.01 * time / 20;

    if (this.t > 1) {
        this.nextEvent();
    }
}

ReplayCamera.prototype.nextEvent = function() {
    this.counter++;

    // Finished
    if (this.counter >= this.path.length) {
        this.started = false;
        return;
    }

    this.event = this.path[this.counter];

    if (this.event.type == 'camera') {
        this.move(this.event);
    } else if (this.event.type == 'coin') {
        coins[this.event.id].get();
        // Wait a little before launching nextEvent
        (function(self) {
            setTimeout(function() {
                self.nextEvent();
            },500);
        })(this);
    } else if (this.event.type == 'arrow') {
        this.moveHermite(cameras.cameras[this.event.id]);
    } else if (this.event.type == 'reset') {
        this.reset();
        (function (self) {
            setTimeout(function() {
                self.nextEvent();
            },500);
        })(this);
    }
}

ReplayCamera.prototype.reset = function() {
    this.resetBobomb();
    this.moving = false;
    this.movingHermite = false;
    // this.position.copy(new THREE.Vector3(-8.849933489419644, 9.050627639459208, 0.6192960680432451));
    // this.target.copy(new THREE.Vector3(17.945323228767702, -15.156828589982375, -16.585740412769756));
    // this.anglesFromVectors();
}

ReplayCamera.prototype.resetBobomb = function() {
    this.position.copy(new THREE.Vector3(34.51854618261728,10.038879540840306,-21.772598201888613));
    this.target.copy(new THREE.Vector3(-2.593404107644737,8.039712770013185,-6.983870133675925));
    this.anglesFromVectors();
}

ReplayCamera.prototype.vectorsFromAngles = function() {
    // Update direction
    this.forward.y = Math.sin(this.phi);

    var cos = Math.cos(this.phi);
    this.forward.z = cos * Math.cos(this.theta);
    this.forward.x = cos * Math.sin(this.theta);
    this.forward.normalize();

}

ReplayCamera.prototype.anglesFromVectors = function() {
    // Update phi and theta so that return to reality does not hurt
    var forward = Tools.diff(this.target, this.position);
    forward.normalize();

    this.phi = Math.asin(forward.y);

    // Don't know why this line works... But thanks Thierry-san and
    // Bastien because it seems to work...
    this.theta = Math.atan2(forward.x, forward.z);
}

ReplayCamera.prototype.move = function(otherCamera) {
    this.moving = true;
    this.old_target =   this.target.clone();
    this.old_position = this.position.clone();
    this.new_target =   new THREE.Vector3(otherCamera.target.x, otherCamera.target.y, otherCamera.target.z);
    this.new_position = new THREE.Vector3(otherCamera.position.x, otherCamera.position.y, otherCamera.position.z);
    this.t = 0;

}

ReplayCamera.prototype.moveHermite = function(otherCamera) {
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
}
