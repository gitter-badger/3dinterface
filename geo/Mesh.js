var mesh = {};

// Mesh
mesh.Mesh = function() {
    this.vertices = [];
    this.faces = [];
    this.texCoords = [];
    this.faceIndex = 0;
    this.material = null;
}

mesh.Mesh.prototype.addVertex = function(vertex) {

    if (vertex instanceof mesh.Vertex) {
        this.vertices.push(vertex);
    } else if (typeof vertex === 'string' || vertex instanceof String) {
        this.vertices.push(new mesh.Vertex(vertex));
    } else {
        console.error("Can only add vertex from mesh.Vertex or string");
        return;
    }

    return this.vertices[this.vertices.length - 1];
}

mesh.Mesh.prototype.addFaces = function(face) {
    this.index = this.faces.length;

    var faces;

    if (face instanceof mesh.Face) {
        this.faces.push(face);
    } else if (typeof face === 'string' || face instanceof String) {
        faces = parseFace(face);
        this.faces = this.faces.concat(faces);
    } else {
        console.error("Can only add face from mesh.Face or string");
        return;
    }

    if (faces === undefined) {
        return this.faces[this.faces.length - 1];
    } else {
        return faces;
    }
}

mesh.Mesh.prototype.addTexCoord = function(texCoord) {
    this.index = this.texCoords.length;

    if (texCoord instanceof mesh.TexCoord) {
        this.texCoords.push(texCoord);
    } else if (typeof texCoord === 'string' || texCoord instanceof String) {
        this.texCoords.push(new mesh.TexCoord(texCoord));
    } else {
        console.error("Can only add texCoord from mesh.TexCoord or string");
        return;
    }

    return this.texCoords[this.texCoords.length - 1];
}

mesh.Mesh.prototype.isFinished = function() {
    return this.faces.length === this.faceIndex;
}

// Vertex
mesh.Vertex = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        var split = arguments[0].replace(/\s+/g, " ").split(' ');
        this.x = parseFloat(split[1]);
        this.y = parseFloat(split[2]);
        this.z = parseFloat(split[3]);
    }
    this.sent = false;
}

mesh.Vertex.prototype.toList = function() {
    return ['v', this.index, this.x, this.y, this.z];
}

mesh.Vertex.prototype.toString = function() {
    return 'v ' + this.x + ' ' + this.y + ' ' + this.z;
}


// TexCoord : texture coordinates
mesh.TexCoord = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        var split = arguments[0].replace(/\s+/g, " ").split(' ');
        this.x = parseFloat(split[1]);
        this.y = parseFloat(split[2]);
    }
    this.sent = false;
}

mesh.TexCoord.prototype.toList = function() {
    return ['vt', this.index, this.x, this.y];
}

mesh.TexCoord.prototype.toString = function() {
    return 'vt ' + this.x + ' ' + this.y;
}


// Face
mesh.Face = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        if (arguments[0].indexOf('/') === -1) {
            // No / : easy win : "f 1 2 3"  or "f 1 2 3 4"
            var split = arguments[0].replace(/\s+/g, ' ').split(' ');
            this.a = parseInt(split[1]) - 1;
            this.b = parseInt(split[2]) - 1;
            this.c = parseInt(split[3]) - 1;

        } else {
            // There might be textures coords
            var split = arguments[0].replace(/\s+/g, ' ').trim().split(' ');

            // Split elements
            var split1 = split[1].split('/');
            var split2 = split[2].split('/');
            var split3 = split[3].split('/');

            var vIndex = 0;
            // var tIndex = split1.length === 2 ? 1 : 2;
            var tIndex = 1;

            this.a = parseInt(split1[vIndex]) - 1; this.aTexture = parseInt(split1[tIndex]) - 1;
            this.b = parseInt(split2[vIndex]) - 1; this.bTexture = parseInt(split2[tIndex]) - 1;
            this.c = parseInt(split3[vIndex]) - 1; this.cTexture = parseInt(split3[tIndex]) - 1;

        }
    }

    this.sent = false;

}


var parseFace = function(arg) {
    var split = arg.split(' ');
    var ret = [];

    // Face3
    if (split.length >= 4) {
        ret.push(new mesh.Face(arg));
    }

    if (split.length >= 5) {
        ret.push(new mesh.Face(
            [
                split[0],
                split[1],
                split[3],
                split[4]
            ].join(' ')
        ));
    }

    return ret;
}

mesh.Face.prototype.max = function() {
    if (this.d !== undefined) {
        return Math.max(this.a, this.b, this.c, this.d);
    } else {
        return Math.max(this.a, this.b, this.c);
    }
}

mesh.Face.prototype.maxTexture = function() {
    if (this.dTexture) {
        return Math.max(this.aTexture, this.bTexture, this.cTexture, this.dTexture);
    } else {
        return Math.max(this.aTexture, this.bTexture, this.cTexture);
    }
}

mesh.Face.prototype.toList = function() {
    var l = ['f', this.index, this.a, this.b, this.c];

    // if (this.d !== undefined)
    //     l.push(this.d);

    // if (this.aTexture !== undefined) {
    //     l.push(this.aTexture);
    //     l.push(this.bTexture);
    //     l.push(this.cTexture);
    // }

    // if (this.dTexture !== undefined)
    //     l.push(this.dTexture);

    return l;
}

mesh.Face.prototype.toString = function() {
    return 'f ' + this.a + ' ' + this.b + ' ' + this.c + (this.d !== undefined ? ' ' + this.d : '');
}

// Material
mesh.Material = function() {
    var split = arguments[0].replace(/\s+/g, ' ').split(' ');
    this.name = split[1];
}

mesh.Material.prototype.toString = function() {
    return 'usemtl ' + this.name;
}

mesh.Material.prototype.toList = function() {
    return ['u', this.name];
}

module.exports = mesh;
