var Coin = function(x,y,z) {
    if (Coin.BASIC_MESH !== null) {
            this.mesh = Coin.BASIC_MESH.clone();
            this.mesh.position.x = x;
            this.mesh.position.y = y;
            this.mesh.position.z = z;
    } else {
        (function(self) {
            setTimeout(function() {
                self.mesh = Coin.BASIC_MESH.clone();
                self.mesh.position.x = x;
                self.mesh.position.y = y;
                self.mesh.position.z = z;
            },1000);
        })(this);
    }
}

Coin.prototype.init = function(x,y,z) {
    if (Coin.BASIC_MESH !== null) {
        this.mesh = Coin.BASIC_MESH.clone();
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
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
    this.mesh.rotation.y += 0.1;
}

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
