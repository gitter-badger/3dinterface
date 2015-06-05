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

Coin.domElement = document.createElement('canvas');
Coin.domElement.style.position = 'absolute';
// Coin.domElement.style.cssFloat = 'top-right';
Coin.domElement.style.top = "0px";
Coin.domElement.style.right = "0px";

Coin.image = new Image();
Coin.image.src = '/static/img/redcoin.png';

Coin.update = function() {
    console.log("ok");
    Coin.domElement.width = Coin.domElement.width;

    Coin.ctx.drawImage(Coin.image,200,25,30,30);

    Coin.ctx.fillStyle = 'red';
    Coin.ctx.strokeStyle = 'black';

    Coin.ctx.font = "30px Verdana";
    Coin.ctx.fillText(Coin.total - 1 + " / " + 8, 125, 50);
    Coin.ctx.strokeText(Coin.total - 1 + " / " + 8, 125, 50);

    Coin.ctx.fill();
    Coin.ctx.stroke();

}

Coin.image.onload = Coin.update;

Coin.total = 1;
Coin.ctx = Coin.domElement.getContext('2d');
Coin.update();

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

        Coin.update();
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
