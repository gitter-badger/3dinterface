var Coin = function(x, y, z, callback) {

    THREE.Object3D.apply(this, []);

    if (typeof x === 'number') {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    } else if (typeof x === 'object') {
        this.position.x = x.x;
        this.position.y = x.y;
        this.position.z = x.z;

        if (typeof y === 'number') {
            this.scale.set(y, y, y);
        }

        if (typeof z === 'boolean') {
            this.visible = z;
        }
    }

    this.rotating = true;

    if (typeof callback === 'function') {
        this.callback = callback;
    }

    this.raycastable = true;

    this.addChild();

};

Coin.prototype = Object.create(THREE.Object3D.prototype);
Coin.constructor = Coin;

// Default callback
Coin.prototype.callback = function() {};

Coin.prototype.addChild = function() {

    if (Coin.BasicMesh instanceof THREE.Mesh) {
        // if mesh is ready, clone it
        var mesh = Coin.BasicMesh.clone();
        mesh.material = mesh.material.clone();
        this.add(mesh);
    } else {
        // Add it later
        Coin.toAdd.push(this);
    }

}

Coin.prototype.addToScene = function(scene) {
    scene.add(this);
};

Coin.prototype.update = function() {

    if (this.rotating) {
        this.rotation.y += 0.1;
    }

    if (this.got) {
        if (this.children[0].material.opacity > 0.02) {

            // First update
            this.rotation.y += 0.3;
            this.position.y += 0.05;
            this.children[0].material.opacity -= 0.05;


        } else {

            this.visible = false;
            this.raycastable = false;

        }

    }

};

Coin.prototype.get = function() {

    if (this.got) {
        return;
    }

    this.got = true;

    this.callback();

    this.children[0].material.transparent = true;
    this.children[0].material.opacity = 1;

    Coin.sounds[Coin.total ++].play();

    if (typeof Coin.onCoinGot === 'function')
        Coin.onCoinGot(Coin.total);

    if (Coin.total === Coin.max) {

        // You got the last coin
        var music = document.getElementById('music');
        if (music !== null) {
            var wasPlaying = !music.paused;
            music.pause();
            setTimeout(function() {
                Coin.lastSound.play();
                setTimeout(function() {
                    if (wasPlaying) {
                        music.play();
                    }
                }, Coin.lastSound.duration*1000);
            }, Coin.sounds[0].duration*1000);
        }
    }

};

Coin.prototype.raycast = function(raycaster, intersects) {

    if (this.children[0] !== undefined) {

        var intersectsThis = [];
        this.children[0].raycast(raycaster, intersectsThis);

        // Add closest object
        if (intersectsThis[0] !== undefined) {

            intersectsThis[0].object = this;
            intersects.push(intersectsThis[0]);

        }

    }

};

Coin.toAdd = [];

Coin.init = function(scale) {

    if (scale === undefined) {
        scale = 1;
    }

    Coin.max = 8;

    if (Coin.initialized === true) {
        return;
    }

    Coin.initialized = true;

    var loader = new THREE.OBJLoader();

    loader.load(
        '/static/data/coin/Coin.obj',
        function(object) {
            object.traverse(function(mesh) {
                if (mesh instanceof THREE.Mesh) {
                    mesh.raycastable = true;
                    mesh.scale.set(scale, scale, scale);
                    mesh.material.color.setHex(0xff0000);
                    mesh.geometry.computeVertexNormals();
                    Coin.BasicMesh = mesh;
                    Coin.addEarlyArrivers();
                }
            });
        }
    );
};

Coin.addEarlyArrivers = function() {

    var mesh;

    for (var i = 0; i < Coin.toAdd.length; i++) {

        var coin = Coin.toAdd[i];
        mesh = Coin.BasicMesh.clone();
        mesh.material = mesh.material.clone();
        coin.add(mesh);

    }

};

Coin.init();

Coin.Config = { NONE : 0, SOME : 1, ALL : 2};

// Sounds
Coin.extension = (new Audio()).canPlayType("audio/x-vorbis") === "" ? ".ogg" : ".mp3";

Coin.sounds = [];
for (var i = 0; i < 8; i++) {

    Coin.sounds.push(new Audio('/static/data/music/redcoins/' + (i+1) + Coin.extension));
    Coin.sounds[Coin.sounds.length-1].preload = "auto";

}

Coin.lastSound = new Audio('/static/data/music/starappears' + Coin.extension);
Coin.lastSound.preload = "auto";

Coin.total = 0;
