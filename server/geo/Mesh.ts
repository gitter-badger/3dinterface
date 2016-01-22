module geo {

    export interface Sendable {

        sent : boolean;

        toList() : any[];

    }

    export class Mesh {

        vertices: Vertex[];
        faces: Face[];
        texCoords: TexCoord[];
        normals: Normal[];
        material: string;

        constructor() {

            this.vertices = [];
            this.faces = [];
            this.texCoords = [];
            this.normals = [];
            this.material = null;

        }

        hasNormals() : boolean {

            return this.normals.length > 0;

        }

        addVertex(vertex : Vertex) : Vertex;
        addVertex(vertex : string) : Vertex;

        addVertex(vertex : any) : Vertex {

            if (vertex instanceof Vertex) {
                this.vertices.push(vertex);
            } else if (typeof vertex === 'string' || vertex instanceof String) {
                this.vertices.push(new Vertex(vertex));
            } else {
                throw new Error('Can only add vertex from geo.Vertex or string');
            }

            return this.vertices[this.vertices.length - 1];

        }

        addFaces(face : Face) : Face[];
        addFaces(face : string) : Face[];

        addFaces(face : any) : Face[] {

            if (face instanceof Face) {
                this.faces.push(face);
                return [this.faces[this.faces.length - 1]];
            } else if (typeof face === 'string' || face instanceof String) {
                let faces = Face.parseFace(face);
                this.faces.push.apply(this.faces, faces);
                return faces;
            } else {
                throw new Error('Can only add face from geo.Face or string');
            }


        }

        addTexCoord(texCoord : TexCoord) : TexCoord;
        addTexCoord(texCoord : string) : TexCoord;

        addTexCoord(texCoord : any) : TexCoord {

            if (texCoord instanceof TexCoord) {
                this.texCoords.push(texCoord);
            } else if (typeof texCoord === 'string' || texCoord instanceof String) {
                this.texCoords.push(new TexCoord(texCoord));
            } else {
                throw new Error('Can only add texCoord from geo.TexCoord or string');
            }

            return this.texCoords[this.texCoords.length - 1];

        }

        addNormal(normal : Normal) : Normal;
        addNormal(normal : string) : Normal;

        addNormal(normal : any) : Normal {

            if (normal instanceof Normal) {
                this.normals.push(normal);
            } else if (typeof normal === 'string' || normal instanceof Normal) {
                this.normals.push(new Normal(normal));
            } else {
                throw new Error('Can only add normal from geo.Normal or string');
            }

            return this.normals[this.normals.length - 1];

        }

    }

}
