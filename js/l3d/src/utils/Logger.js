L3D.BD = {};

L3D.BD.Private = {};

L3D.BD.Private.sendData = function(url, data) {
    if (L3D.BD.Private.enabled) {
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

L3D.BD.Private.enabled = true;

L3D.BD.enable = function() {
    L3D.BD.Private.enabled = true;
};

L3D.BD.disable = function() {
    L3D.BD.Private.enabled = false;
};

L3D.BD.Private.compactCamera = function(camera) {
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

L3D.BD.Event = {};

L3D.BD.Event.ArrowClicked = function() {};
L3D.BD.Event.ArrowClicked.prototype.send = function() {
    var url = "/arrow-clicked";
    var data = {arrow_id: this.arrow_id};
    L3D.BD.Private.sendData(url, data);
};

L3D.BD.Event.CoinClicked = function() {};
L3D.BD.Event.CoinClicked.prototype.send = function() {
    var url = "/coin-clicked";
    var data = {coin_id: this.coin_id};
    L3D.BD.Private.sendData(url, data);
};

L3D.BD.Event.KeyboardEvent = function() {};
L3D.BD.Event.KeyboardEvent.prototype.send = function() {
    var url = "/keyboard-event";

    var data = {
        camera: L3D.BD.Private.compactCamera(this.camera)
    };

    L3D.BD.Private.sendData(url, data);
};

L3D.BD.Event.ResetClicked = function() {};
L3D.BD.Event.ResetClicked.prototype.send = function() {
    var url = "/reset-clicked";
    var data = {};
    L3D.BD.Private.sendData(url, data);
};

L3D.BD.Event.PreviousNextClicked = function() {};
L3D.BD.Event.PreviousNextClicked.prototype.send = function() {
    var url = "/previous-next-clicked";
    var data = {
        // casts previous to boolean
        previous: this.previous,
        camera: L3D.BD.Private.compactCamera(this.camera)
    };

    L3D.BD.Private.sendData(url, data);
};

L3D.BD.Event.Hovered = function() {};
L3D.BD.Event.Hovered.prototype.send = function() {
    var url = "/hovered";
    var data = {
        start: this.start,
        arrow_id: this.arrow_id
    };

    L3D.BD.Private.sendData(url, data);
};

L3D.BD.Event.Fps = function() {};
L3D.BD.Event.Fps.prototype.send = function() {

    var url = "/fps";
    var data = {
        fps: this.fps
    };

    L3D.BD.Private.sendData(url, data);

};
