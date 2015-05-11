var Coin = function(x,y,z) {
    this.ready = false;
    this.got = false;
    this.init(x,y,z);
}

Coin.prototype.init = function(x,y,z) {
    if (Coin.BASIC_MESH !== null) {
        this.mesh = Coin.BASIC_MESH.clone();
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
        this.mesh.raycastable = true;
        this.ready = true;
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
        var sound = new Audio('/static/data/music/redcoins/' + Coin.total + '.mp3');
        sound.play();
        console.log(sound)
    }
}

Coin.total = 0;
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