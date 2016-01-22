let fs = require('fs');

module geo {

    export class MeshContainer {

        meshes : Mesh[];
        vertices : Vertex[];
        faces : Face[];
        normals : Normal[];
        texCoords : TexCoord[];
        transformation : Transformation;
        callback : Function;
        numberOfFaces : number;
        recommendations : any[];

        constructor(path? : string, transfo? : Transformation, callback? : Function) {

            if (transfo === undefined) transfo = new Transformation();

            this.transformation = transfo;

            this.meshes = [];
            this.vertices = [];
            this.faces = [];
            this.normals = [];
            this.texCoords = [];
            this.numberOfFaces = 0;
            this.callback = typeof callback === 'function' ? callback : function(){};

            if (path !== undefined) {
                this.loadFromFile('../' + path);
            }

        }

        loadFromFile(path : string) : void {

            // Be carefule : use this
            fs.readFile(path, {encoding : 'utf-8'}, (err : any, data : any) => {

                let currentMesh : Mesh = null;
                let lines = data.toString('utf-8').split('\n');

                for (let i = 0; i < lines.length; i++) {

                    let line = lines[i];

                    if (line[0] === 'v') {

                        if (line[1] === 't') {

                            // Texture coord
                            var texCoord = new TexCoord(line);
                            texCoord.index = this.texCoords.length;
                            this.texCoords.push(texCoord);

                        } else if (line[1] === 'n') {

                            var normal = new Normal(line);
                            normal.index = this.normals.length;
                            this.normals.push(normal);

                        } else {

                            // Just a simple vertex
                            var vertex = new Vertex(line);
                            var vertexTransformed = this.transformation.applyTo(vertex);

                            vertex.x = vertexTransformed.x;
                            vertex.y = vertexTransformed.y;
                            vertex.z = vertexTransformed.z;

                            vertex.index = this.vertices.length;
                            this.vertices.push(vertex);

                        }

                    } else if (line[0] === 'f') {

                        this.numberOfFaces++;

                        // Create mesh if it doesn't exist
                        if (currentMesh === undefined) {
                            currentMesh = new Mesh();
                            this.meshes.push(currentMesh);
                        }

                        // Create faces (two if Face4)
                        var faces = currentMesh.addFaces(line);

                        faces[0].index = this.faces.length;
                        faces[0].meshIndex = this.meshes.length - 1;
                        this.faces.push(faces[0]);

                        if (faces.length === 2) {

                            this.numberOfFaces++;
                            faces[1].index = this.faces.length;
                            faces[1].meshIndex = this.meshes.length - 1;
                            this.faces.push(faces[1]);

                        }

                    } else if (line[0] === 'u') {

                        // usemtl : create a new mesh
                        currentMesh = new Mesh();
                        this.meshes.push(currentMesh);
                        currentMesh.material = (new Material(line)).name;

                    }

                }


                this.callback();

            }

        );

    }


}

}
