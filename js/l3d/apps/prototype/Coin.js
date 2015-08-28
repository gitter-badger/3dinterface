var Coin = function(x,y,z, callback) {
    this.raycastable = true;
    this.children = [];
    this.ready = false;
    this.got = false;
    this.init(x,y,z);
    this.rotating = true;
    if (callback) {
        this.callback = callback;
    }
};

var _toto = new Audio();
Coin.extension = _toto.canPlayType("audio/x-vorbis") === "" ? ".ogg" : ".mp3";

Coin.sounds = [];
for (var i = 0; i < 8; i++) {
    Coin.sounds.push(new Audio('/static/data/music/redcoins/' + (i+1) + Coin.extension));
    Coin.sounds[Coin.sounds.length-1].preload = "auto";

}

Coin.domElement = document.createElement('canvas');
Coin.domElement.style.position = 'absolute';
Coin.domElement.style.cssFloat = 'top-left';
Coin.domElement.style.top = "0px";
Coin.domElement.style.left = "0px";

Coin.lvl = 0;

Coin.setSize = function(width,height) {
    this.domElement.width = width;
    this.domElement.height = height;
    this.update();
};

// Coin.image = new Image();
// Coin.image.src = '/static/img/redcoin.png';

Coin.initSize = function() {
    try {
        Coin.domElement.width = container_size.width();
        Coin.domElement.height = container_size.height();
    } catch (e) {
        setTimeout(100, Coin.initSize);
        return;
    }
};

Coin.update = function() {

    var x;
    try {
        x = container_size.width() * 4.75 / 5;
        Coin.domElement.width = container_size.width();
        Coin.domElement.height = container_size.height();
    } catch (e) {
        return;
    }

    // Coin.domElement.width = Coin.domElement.width;

    // Coin.ctx.drawImage(Coin.image, x + 75,25,30,30);

    // Coin.ctx.fillStyle = 'red';
    // Coin.ctx.strokeStyle = 'black';

    // Coin.ctx.font = "30px Verdana";
    // Coin.ctx.lineWidth = 5;
    // Coin.ctx.strokeText(Coin.total + " / " + Coin.max, x, 50);
    // Coin.ctx.fillText(Coin.total + " / " + Coin.max, x, 50);

    // Coin.ctx.stroke();
    // Coin.ctx.fill();

    Coin.domElement.width = Coin.domElement.width;

    var width = 10;
    var height = 100;
    var lvl = Coin.lvl;
    var grd = Coin.ctx.createLinearGradient(x,20,width,height);
    grd.addColorStop(1, "red");
    grd.addColorStop(0.5, "green");

    Coin.ctx.fillStyle = grd;
    Coin.ctx.fillRect(x,20 + (1-lvl)*height,10,(lvl*height));

    Coin.ctx.beginPath();
    Coin.ctx.moveTo(x,20);
    Coin.ctx.lineTo(x,120);
    Coin.ctx.lineTo(x+width,120);
    Coin.ctx.lineTo(x+width,20);
    Coin.ctx.stroke();
    Coin.ctx.closePath();

    Coin.ctx.fillStyle = 'black';
    Coin.ctx.font="20px Arial";
    Coin.ctx.fillText('Score', x - 60, 25);

};

Coin.set = function() {
    var newLvl = Coin.total / Coin.max;
    Coin.lvl+=0.01*Math.sign(newLvl-Coin.lvl);
    if (Math.abs(Coin.lvl-newLvl) > 0.005) {
        Coin.update();
        setTimeout(function() {
            Coin.set(newLvl);
        },50);
    }
}

// Coin.image.onload = Coin.update;

Coin.ctx = Coin.domElement.getContext('2d');
Coin.update();

Coin.prototype.init = function(x,y,z) {
    if (Coin.BASIC_MESH !== null) {
        this.mesh = Coin.BASIC_MESH.clone();
        this.mesh.material = this.mesh.material.clone();
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
};

Coin.prototype.raycast = function(raycaster, intersects) {
    if (this.mesh !== undefined) {

        var intersectsThis = [];
        this.mesh.raycast(raycaster, intersectsThis);

        // Add closest object
        if (intersectsThis[0] !== undefined) {

            intersectsThis[0].object = this;
            intersects.push(intersectsThis[0]);

        }

    }

};

Coin.prototype.addToScene = function(scene) {
    scene.add(this.mesh);
};

Coin.prototype.update = function() {
    var self = this;
    if (this.ready && this.rotating)
        this.mesh.rotation.y += 0.1;

    if (this.got) {
        if (this.mesh.material.opacity > 0.02) {

            // First update
            this.mesh.rotation.y += 0.3;
            this.mesh.position.y += 0.05;
            this.mesh.material.opacity -= 0.05;


        } else {

            this.mesh.visible = false;
            this.raycastable = false;

        }

    }
};

Coin.prototype.get = function() {
    if (!this.got) {
        this.got = true;

        if (typeof Coin.onCoinGot === 'function') {
            Coin.onCoinGot(Coin.total + 1);
        }

        // Call the callback if any
        if (this.callback)
            this.callback();

        this.mesh.material.transparent = true;
        this.mesh.material.opacity = 1;

        Coin.sounds[Coin.total ++].play();
        if (Coin.total === 8) {
            if (typeof Coin.onLastCoin === 'function') {
                Coin.onLastCoin();
            }
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
        }

        Coin.set();
    }
};

Coin.lastSound = new Audio('/static/data/music/starappears' + Coin.extension);
Coin.lastSound.preload = "auto";

Coin.total = 0;
Coin.BASIC_MESH = null;

Coin._loader = new THREE.OBJLoader();

Coin.init = function(scale) {
    Coin.max = 8;
    if (!Coin.initialized) {
        Coin.initialized = true;

        if (scale === undefined) {
            scale = 0.005;
        }

        Coin._loader.load(
            '/static/data/coin/Coin.obj',
            function(object) {
                object.traverse(function (mesh) {
                    if (mesh instanceof THREE.Mesh) {
                        mesh.scale.set(scale,scale,scale);
                        mesh.material.color.setHex(0xff0000);
                        mesh.geometry.computeVertexNormals();
                        mesh.raycastable = true;
                        Coin.BASIC_MESH = mesh;
                    }
                });
            }
        );

        Coin.nextSound = new Audio('/static/data/music/redcoins/1' + Coin.extension);
    }
};
