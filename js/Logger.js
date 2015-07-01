var BD = {};

BD.Private = {};

BD.Private.sendData = function(url, data) {
    if (BD.Private.enabled) {
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

BD.Private.enabled = true;

BD.enable = function() {
    BD.Private.enabled = true;
};

BD.disable = function() {
    BD.Private.enabled = false;
};

BD.Private.compactCamera = function(camera) {
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

BD.Event = {};

BD.Event.ArrowClicked = function() {};
BD.Event.ArrowClicked.prototype.send = function() {
    var url = "/arrow-clicked";
    var data = {arrow_id: this.arrow_id};
    BD.Private.sendData(url, data);
};

BD.Event.CoinClicked = function() {};
BD.Event.CoinClicked.prototype.send = function() {
    var url = "/coin-clicked";
    var data = {coin_id: this.coin_id};
    BD.Private.sendData(url, data);
};

BD.Event.KeyboardEvent = function() {};
BD.Event.KeyboardEvent.prototype.send = function() {
    var url = "/keyboard-event";

    var data = {
        camera: BD.Private.compactCamera(this.camera)
    };

    BD.Private.sendData(url, data);
};

BD.Event.ResetClicked = function() {};
BD.Event.ResetClicked.prototype.send = function() {
    var url = "/reset-clicked";
    var data = {};
    BD.Private.sendData(url, data);
};

BD.Event.PreviousNextClicked = function() {};
BD.Event.PreviousNextClicked.prototype.send = function() {
    var url = "/previous-next-clicked";
    var data = {
        // casts previous to boolean
        previous: this.previous,
        camera: BD.Private.compactCamera(this.camera)
    };

    BD.Private.sendData(url, data);
};

BD.Event.Hovered = function() {};
BD.Event.Hovered.prototype.send = function() {
    var url = "/hovered";
    var data = {
        start: this.start,
        arrow_id: this.arrow_id
    };

    BD.Private.sendData(url, data);
};

BD.Event.Fps = function() {};
BD.Event.Fps.prototype.send = function() {

    var url = "/fps";
    var data = {
        fps: this.fps
    };

    BD.Private.sendData(url, data);

};
