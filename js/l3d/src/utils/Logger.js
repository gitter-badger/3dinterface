/**
 * @namespace
 * @memberof L3D
 */
L3D.DB = {};

/**
 * @namespace
 * @memberof L3D.DB
 */
L3D.DB.Private = {};

/**
 * Sends an object to an url (use JSON)
 * @memberof L3D.DB.Private
 * @param url {String} the url to send the request
 * @param data {Object} the data to send to the url
 * @param force {Boolean} if the DB is disabled, the message will only be sent if force is true
 */
L3D.DB.Private.sendData = function(url, data, force) {
    if (L3D.DB.Private.enabled || force) {
        // Append time to data
        data.time = Date.now() / 1000;

        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");

        // xhr.onreadystatechange = function() {
        //     if(xhr.readyState == 4 && xhr.status == 200) {
        //         console.log("Done : " + xhr.responseText);
        //     }
        // }

        xhr.send(JSON.stringify(data));
    }
};

/**
 * If false, only forced requests will be sent
 * @memberof L3D.DB.Private
 * @type {Boolean}
 */
if (typeof module === 'object')
    DB_DISABLED = true;
L3D.DB.Private.enabled = !DB_DISABLED;

/**
 * Enables the requests
 * @memberof L3D.DB
 */
L3D.DB.enable = function() {
    L3D.DB.Private.enabled = true;
};

/**
 * Disables the requests
 * @memberof L3D.DB
 */
L3D.DB.disable = function() {
    L3D.DB.Private.enabled = false;
};

/**
 * Compacts a camera
 * @memberof L3D.DB.Private
 * @param camera {L3D.PointerCamera} a camera with a position and a target
 * @return {Object} an object containing a position and a target
 */
L3D.DB.Private.compactCamera = function(camera) {
    return {
        position: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        },
        target: {
            x: camera.target.x,
            y: camera.target.y,
            z: camera.target.z
        }
    };
};

/**
 * Contains all the classes to log events into the DB. You must set the
 * attribute of the instance, and then call the <code>send</code> method
 * on them to send them.
 * @namespace
 * @memberof L3D.DB
 */
L3D.DB.Event = {};

/**
 * An event when an arrow is clicked
 * @constructor
 * @memberof L3D.DB.Event
 */
L3D.DB.Event.ArrowClicked = function() {

    /**
     * Id of the arrow
     * @type {Number}
     */
    this.arrowId = null;

};

/**
 * Sends the event to the correct url
 */
L3D.DB.Event.ArrowClicked.prototype.send = function() {
    var url = "/posts/arrow-clicked";
    var data = {arrowId: this.arrowId};
    L3D.DB.Private.sendData(url, data);
};

/**
 * An event when a coin is taken
 * @constructor
 * @memberof L3D.DB.Event
 */
L3D.DB.Event.CoinClicked = function() {

    /**
     * Id of the coin taken
     * @type {Number}
     */
    this.coinId = null;
};

/**
 * Sends the event to the correct url
 */
L3D.DB.Event.CoinClicked.prototype.send = function() {
    var url = "/posts/coin-clicked";
    var data = {coinId: this.coinId};
    L3D.DB.Private.sendData(url, data);
};

/**
 * An event when the keyboard is touched
 * @constructor
 * @memberof L3D.DB.Event
 */
L3D.DB.Event.KeyboardEvent = function() {

    /**
     * A reference to the camera
     * @type {L3D.PointerCamera}
     */
    this.camera = null;

};

/**
 * Sends the event to the correct url
 */
L3D.DB.Event.KeyboardEvent.prototype.send = function() {
    var url = "/posts/keyboard-event";

    var data = {
        camera: L3D.DB.Private.compactCamera(this.camera),
        keycode: this.keycode, // -1 represents mouse event
        keypressed: this.keypressed // mousepressed if keycode === -1
    };

    L3D.DB.Private.sendData(url, data);
};

/**
 * An event when the reset button is clicked
 * @constructor
 * @memberof L3D.DB.Event
 */
L3D.DB.Event.ResetClicked = function() {};

/**
 * Sends the event to the correct url
 */
L3D.DB.Event.ResetClicked.prototype.send = function() {
    var url = "/posts/reset-clicked";
    var data = {};
    L3D.DB.Private.sendData(url, data);
};

/**
 * An event when previous or next buttons are clicked
 * @constructor
 * @memberof L3D.DB.Event
 */
L3D.DB.Event.PreviousNextClicked = function() {

    /**
     * A reference to the camera
     * @type {L3D.PointerCamera}
     */
    this.camera = null;

};

/**
 * Sends the event to the correct url
 */
L3D.DB.Event.PreviousNextClicked.prototype.send = function() {
    var url = "/posts/previous-next-clicked";
    var data = {
        // casts previous to boolean
        previous: this.previous,
        camera: L3D.DB.Private.compactCamera(this.camera)
    };

    L3D.DB.Private.sendData(url, data);
};

/**
 * An event when a recommendation is hovered
 * @constructor
 * @memberof L3D.DB.Event
 */
L3D.DB.Event.Hovered = function() {

    /**
     * The id of the arrow hovered
     * @type {Number}
     */
    this.arrowId = null;

    /**
     * true if the hover starts, false if finishes
     * @type {Boolean}
     */
    this.start = null;

};

/**
 * Sends the event to the correct url
 */
L3D.DB.Event.Hovered.prototype.send = function() {
    var url = "/posts/hovered";
    var data = {
        start: this.start,
        arrowId: this.arrowId
    };

    L3D.DB.Private.sendData(url, data);
};

/**
 * An event with the framerate of the client
 * @constructor
 * @memberof L3D.DB.Event
 */
L3D.DB.Event.Fps = function() {

    /**
     * the frame rate
     * @type {Number}
     */
    this.fps = null;

};

/**
 * Sends the event to the correct url
 */
L3D.DB.Event.Fps.prototype.send = function() {

    var url = "/posts/fps";
    var data = {
        fps: this.fps
    };

    L3D.DB.Private.sendData(url, data);

};

/**
 * An event when the pointer is locked
 * @constructor
 * @memberof L3D.DB.Event
 */
L3D.DB.Event.PointerLocked = function() {

    /**
     * True if the pointer is locked, false otherwise
     * @type {Boolean}
     */
    this.locked = null;

};

/**
 * Sends the event to the correct url
 */
L3D.DB.Event.PointerLocked.prototype.send = function() {
    var url = "/posts/pointer-locked";
    var data = {
        locked: this.locked
    };

    L3D.DB.Private.sendData(url, data);
};

/**
 * An event when the pointer lock option is changed
 * @constructor
 * @memberof L3D.DB.Event
 */
L3D.DB.Event.SwitchedLockOption = function() {

    /**
     * True if the lock option is enabled, false otherwise
     * @type {Boolean}
     */
    this.locked = null;

};

/**
 * Sends the event to the correct url
 */
L3D.DB.Event.SwitchedLockOption.prototype.send = function() {
    var url = "/posts/switched-lock-option";

    var data = {
        locked: this.locked
    };

    L3D.DB.Private.sendData(url, data);
};
