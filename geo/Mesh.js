var fs = require('fs');

var geo = geo || {};

geo.MeshStreamer = function(path, callback) {
    this.vertices = [];
    this.textureCoords = [];
    this.faces = [];
    this.orderedElements = [];
    this.index = 0;

    if (path !== undefined) {
        var self = this;
        this.loadFromFile(path, function() {

            self.orderedElements = self.tryMerge();

            if (typeof callback === 'function')
                callback();

        });
    }
}

geo.MeshStreamer.prototype.loadFromFile = function(path, callback) {
    var self = this;
    fs.readFile(path, function(err, data) {

        // Get lines from file
        var lines = data.toString('utf-8').split("\n");

        // For each line
        for (var i = 0; i < lines.length; i++) {

            var line = lines[i];

            if (line[0] === 'v') {

                if (line[1] === 't') {

                    // Texture coord
                    var texCoord = self.textureCoords[self.textureCoords.push(new geo.TextureCoord(line)) - 1];
                    self.orderedElements.push(texCoord);

                } else if (line[1] === 'n') {

                    // Ignore normals

                } else {

                    // Just a simple vertex
                    var vertex = self.vertices[self.vertices.push(new geo.Vertex(line)) - 1];
                    self.orderedElements.push(vertex);

                }

            } else if (line[0] === 'f') {

                // Create face
                var face = self.faces[self.faces.push(new geo.Face(line)) - 1];
                self.orderedElements.push(face);

                // Check
                // if (face.max() >= self.vertices.length || face.maxTexture() >= self.textureCoords.length) {
                //     console.log("Error");
                // }

            } else if (line[0] === 'u') {

                // usemtl
                self.orderedElements.push(new geo.Usemtl(line));

            }

        }

        if (typeof callback === 'function') {
            callback();
        }
    });
}

geo.MeshStreamer.prototype.tryMerge = function() {
    if (this.faces[0].aTexture !== undefined) {
        return this.orderedElements;
    } else {
        return this.merge();
    }
}

geo.MeshStreamer.prototype.merge = function(callback) {
    // Gives for each vertex the indices of the faces in which it is present
    var vertexFace = [];

    // Result variable
    var orderedElements = [];

    // For each vertex
    for (var i = 0; i < this.vertices.length; i++) {

        // Init the list of faces where this vertex is
        vertexFace.push([]);

    }

    // For each face
    for (var i = 0; i < this.faces.length; i++) {

        var face = this.faces[i];

        // For each vertex of the face, and the face to the list of the correspondant vertex
        vertexFace[face.a].push(i);
        vertexFace[face.b].push(i);
        vertexFace[face.c].push(i);

        if (vertexFace[face.d]) {
            vertexFace[face.d].push(i);
        }

    }

    // For each vertex
    for (var vertex = 0; vertex < this.vertices.length; vertex++) {

        // Print the vertex
        orderedElements.push(this.vertices[vertex]);

        // For each face that contains this vertex
        for (var face = 0; face < vertexFace[vertex].length; face++) {

            var faceToAdd = this.faces[vertexFace[vertex][face]];

            // If the face can be given (that means that all vertices have already been pushed)
            if (faceToAdd.max() <= vertex) {

                // Add it now
                orderedElements.push(faceToAdd);
            }
        }
    }

    if (typeof callback === 'function')
        callback();

    return orderedElements;

}

geo.Vertex = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        var split = arguments[0].replace(/\s+/g, " ").split(' ');
        this.x = parseFloat(split[1]);
        this.y = parseFloat(split[2]);
        this.z = parseFloat(split[3]);
    }
    this.sent = false;
}

geo.Vertex.prototype.toList = function() {
    return ['v', this.x, this.y, this.z];
}

geo.Vertex.prototype.toString = function() {
    return 'v ' + this.x + ' ' + this.y + ' ' + this.z;
}

geo.TextureCoord = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        var split = arguments[0].replace(/\s+/g, " ").split(' ');
        this.x = parseFloat(split[1]);
        this.y = parseFloat(split[2]);
    }
    this.sent = false;
}

geo.TextureCoord.prototype.toList = function() {
    return ['vt', this.x, this.y];
}

geo.TextureCoord.prototype.toString = function() {
    return 'vt ' + this.x + ' ' + this.y;
}

geo.Face = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        if (arguments[0].indexOf('/') === -1) {
            // No / : easy win : "f 1 2 3"  or "f 1 2 3 4"
            var split = arguments[0].replace(/\s+/g, ' ').split(' ');
            this.a = parseInt(split[1]) - 1;
            this.b = parseInt(split[2]) - 1;
            this.c = parseInt(split[3]) - 1;

            if (split.length === 5)
                this.d = parseInt(split[4]) - 1;

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

            if (split.length === 5) {
                var split4 = split[4].split('/');
                this.d = parseInt(split4[vIndex]) - 1; this.dTexture = parseInt(split4[tIndex]) - 1;
            }
        }

    }

    this.sent = false;
}

geo.Face.prototype.max = function() {
    if (this.d) {
        return Math.max(this.a, this.b, this.c, this.d);
    } else {
        return Math.max(this.a, this.b, this.c);
    }
}

geo.Face.prototype.maxTexture = function() {
    if (this.dTexture) {
        return Math.max(this.aTexture, this.bTexture, this.cTexture, this.dTexture);
    } else {
        return Math.max(this.aTexture, this.bTexture, this.cTexture);
    }
}

geo.Face.prototype.toList = function() {
    var l = ['f', this.a, this.b, this.c];
    if (this.d)
        l.push(this.d);

    if (this.aTexture !== undefined) {
        l.push(this.aTexture);
        l.push(this.bTexture);
        l.push(this.cTexture);
    }

    if (this.dTexture)
        l.push(this.dTexture);

    return l;
}

geo.Face.prototype.toString = function() {
    return 'f ' + this.a + ' ' + this.b + ' ' + this.c + (this.d ? ' ' + this.d : '');
}

geo.Usemtl = function() {
    var split = arguments[0].replace(/\s+/g, ' ').split(' ');
    this.name = split[1];
}

geo.Usemtl.prototype.toString = function() {
    return 'usemtl ' + this.name;
}

geo.Usemtl.prototype.toList = function() {
    return ['u', this.name];
}

module.exports = geo;
