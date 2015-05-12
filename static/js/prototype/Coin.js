var Coin = function(x,y,z) {
    this.ready = false;
    this.got = false;
    this.init(x,y,z);
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
                Coin.nextSound = new Audio(static_path + 'data/music/redcoins/1' + Coin.extension);
            },1000);
        })(this,x,y,z);
    }
}

Coin.prototype.addToScene = function(scene) {
    scene.add(this.mesh);
}

Coin.prototype.update = function() {
    if (this.ready)
        (function(self) {
            self.update = function() {
                self.mesh.rotation.y += 0.1;
            }
        })(this);
}

Coin.prototype.get = function() {
    if (!this.got) {
        this.got = true;
        this.mesh.visible = false;
        Coin.total ++;
        Coin.nextSound.play();
        if (Coin.total === 9) {
            // You got the last coin
            var music = document.getElementById('music');
            var wasPlaying = !music.paused;
            music.pause();
            (function(music, wasPlaying) {
                setTimeout(function() {
                    Coin.lastSound.play();
                    (function(wasPlaying) {
                        setTimeout(function() {
                            if (wasPlaying) {
                                music.play();
                            }
                        }, Coin.lastSound.duration*1000);
                    })(wasPlaying);
                }, Coin.nextSound.duration*1000);
            })(music, wasPlaying);
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
Coin._loader.load(
    static_path + 'data/coin/Coin.obj',
    function(object) {
        object.traverse(function (mesh) {
            if (mesh instanceof THREE.Mesh) {
                mesh.scale.set(0.005,0.005,0.005);
                mesh.material.color.setHex(0xff0000);
                mesh.geometry.computeVertexNormals();
                mesh.raycastable = true;
                Coin.BASIC_MESH = mesh
            }
        });
    }
);
