var ProgessiveSphere = function(loader, res) {
    Displayable.call(this);
    this.started = false;
    this.finished = false;
    this.wasFinished = false;
    this.begin = false;
    this.addedToScene = false;

    if (res === undefined)
        res = 5;

    (function(self) {
        loader.load('/data/spheres/' + res + '.obj', function(object) {
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.up = new THREE.Vector3(0,0,1);
                    self.totalMesh = child;
                    self.geometry = new THREE.Geometry();
                    self.material = new THREE.MeshLambertMaterial();
                    self.material.color.setRGB(1,0,0);
                    self.material.side = THREE.DoubleSide;
                    self.mesh = new THREE.Mesh(self.geometry, self.material);
                    self.current_face = 0;
                    self.started = true;
                    self.begin = true;
                    self.addToScene(scene);
                }
            });
        });
    })(this);

}
ProgessiveSphere.prototype = Object.create(Displayable.prototype);
ProgessiveSphere.prototype.constructor = ProgessiveSphere;

ProgessiveSphere.prototype.addFace = function() {
    if (this.started && this.begin && this.addedToScene) {
        if (this.current_face < this.totalMesh.geometry.attributes.position.array.length / 3) {

            // Add the 3 new vertices
            this.geometry.vertices.push(new THREE.Vector3(
                this.totalMesh.geometry.attributes.position.array[3*this.current_face],
                this.totalMesh.geometry.attributes.position.array[3*this.current_face+1],
                this.totalMesh.geometry.attributes.position.array[3*this.current_face+2]
            ));

            this.geometry.vertices.push(new THREE.Vector3(
                this.totalMesh.geometry.attributes.position.array[3*this.current_face+3],
                this.totalMesh.geometry.attributes.position.array[3*this.current_face+4],
                this.totalMesh.geometry.attributes.position.array[3*this.current_face+5]
            ));

            this.geometry.vertices.push(new THREE.Vector3(
                this.totalMesh.geometry.attributes.position.array[3*this.current_face+6],
                this.totalMesh.geometry.attributes.position.array[3*this.current_face+7],
                this.totalMesh.geometry.attributes.position.array[3*this.current_face+8]
            ));

            // Add the new face
            this.geometry.faces.push(new THREE.Face3(
                this.geometry.vertices.length-3,
                this.geometry.vertices.length-2,
                this.geometry.vertices.length-1
            ));

            // Update the stuff
            this.geometry.mergeVertices();
            this.geometry.computeFaceNormals();
            this.geometry.computeVertexNormals();
            this.current_face += 3;
            this.geometry.elementsNeedUpdate = true;
            this.geometry.normalsNeedUpdate = true;
            this.geometry.verticesNeedUpdate = true;
            this.geometry.groupsNeedUpdate = true;
        } else {
            this.finished = true;
        }
    }

    if (!this.wasFinished && this.finished) {
        this.wasFinished = true;
        console.log("Finished reconstructing the mesh !");
    }
}

ProgessiveSphere.prototype.addToScene = function(scene) {
    Displayable.prototype.addToScene.call(this, scene);
    this.addedToScene = true;
}
