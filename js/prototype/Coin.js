var Coin = function(x,y,z, callback) {
    this.ready = false;
    this.got = false;
    this.init(x,y,z);
    if (callback) {
        this.callback = callback;
        this.rotating = true;
    }
}

var _toto = new Audio();
Coin.extension = _toto.canPlayType("audio/x-vorbis") === "" ? ".ogg" : ".mp3";

Coin.prototype.init = function(x,y,z) {
    if (Coin.BASIC_MESH !== null) {
        this.mesh = Coin.BASIC_MESH.clone();
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
        this.ready = true;
        this.mesh.raycastable = true;
    } else {
        (function(self,x,y,z) {
            setTimeout(function() {
                self.init(x,y,z);
            },1000);
        })(this,x,y,z);
    }
}

Coin.prototype.addToScene = function(scene) {
    scene.add(this.mesh);
}

Coin.prototype.update = function() {
    var self = this;
    console.log(this.ready, this.rotating);
    if (this.ready && this.rotating)
        this.mesh.rotation.y += 0.1
}

Coin.prototype.get = function() {
    if (!this.got) {
        this.got = true;

        // Call the callback if any
        if (this.callback)
            this.callback();

        if (this.mesh) {
            this.mesh.visible = false;
        }
        Coin.total ++;
        Coin.nextSound.play();
        if (Coin.total === 9) {
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
                }, Coin.nextSound.duration*1000);
            }
        } else {
            Coin.nextSound = new Audio('/static/data/music/redcoins/' + Coin.total + Coin.extension);
            Coin.nextSound.preload = "auto";
        }
    }
}

Coin.lastSound = new Audio('/static/data/music/starappears' + Coin.extension);
Coin.lastSound.preload = "auto";

Coin.total = 1;
Coin.BASIC_MESH = null;

Coin._loader = new THREE.OBJLoader();

Coin.init = function(scale) {
    if (!Coin.initialized) {
        Coin.initialized = true;

        if (scale === undefined) {
            scale = 0.005;
        }

        Coin._loader.load(
            static_path + 'data/coin/Coin.obj',
            function(object) {
                object.traverse(function (mesh) {
                    if (mesh instanceof THREE.Mesh) {
                        mesh.scale.set(scale,scale,scale);
                        mesh.material.color.setHex(0xff0000);
                        mesh.geometry.computeVertexNormals();
                        mesh.raycastable = true;
                        Coin.BASIC_MESH = mesh
                    }
                });
            }
        );

        Coin.nextSound = new Audio(static_path + 'data/music/redcoins/1' + Coin.extension);
    }
}
