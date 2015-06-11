var fs = require('fs');

var geo = geo || {};

geo.MeshStreamer = function(path, callback) {
    this.vertices = [];
    this.faces = [];
    this.orderedElements = [];
    this.index = 0;

    if (path !== undefined) {
        var self = this;
        this.loadFromFile(path, callback);
    }
}

geo.MeshStreamer.prototype.loadFromFile = function(path, callback) {
    var self = this;
    fs.readFile(path, function(err, data) {
        var lines = data.toString('utf-8').split("\n");
        var vertexCounter = 0;
        var faceCounter = 0;

        //
        var vertex_face = [];

        for (var i = 0; i < lines.length; i++) {

            var line = lines[i];

            if (line[0] === 'v') {

                var vertex = self.vertices[self.vertices.push(new geo.Vertex(line)) - 1];
                vertex_face.push([]);
                vertexCounter ++;

            } else if (line[0] === 'f') {

                var face = self.faces[self.faces.push(new geo.Face(line)) - 1];
                vertex_face[face.a].push(faceCounter);
                vertex_face[face.b].push(faceCounter);
                vertex_face[face.c].push(faceCounter);

                if (vertex_face[face.d]) {
                    vertex_face[face.d].push(faceCounter);
                }

                faceCounter ++;
            }
        }

        for (var vertex = 0; vertex < self.vertices.length; vertex++) {
            self.orderedElements.push(self.vertices[vertex]);
            for (var face = 0; face < vertex_face[vertex].length; face++) {
                var faceToAdd = self.faces[vertex_face[vertex][face]];
                if (faceToAdd.max() <= vertex) {
                    self.orderedElements.push(faceToAdd);
                }
            }
        }

        if (typeof callback === 'function') {
            callback();
        }
    });
}

geo.Vertex = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        var split = arguments[0].split(' ');
        this.x = parseFloat(split[1]);
        this.y = parseFloat(split[2]);
        this.z = parseFloat(split[3]);
    } else if (arguments.length === 3) {
        this.x = arguments[0];
        this.y = arguments[1];
        this.z = arguments[2];
    } else {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    this.sent = false;
}

geo.Vertex.prototype.toList = function() {
    return ['v', this.x, this.y, this.z];
}

geo.Vertex.prototype.toString = function() {
    return 'v ' + this.x + ' ' + this.y + ' ' + this.z;
}

geo.Face = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        var split = arguments[0].split(' ');
        this.a = parseInt(split[1]) - 1;
        this.b = parseInt(split[2]) - 1;
        this.c = parseInt(split[3]) - 1;

        if (split.length === 5)
            this.d = parseInt(split[4]) - 1;

    } else if (arguments.length === 3) {
        this.a = arguments[0] - 1;
        this.b = arguments[1] - 1;
        this.c = arguments[2] - 1;

        if (arguments.length === 4)
            this.d = arguments[3] - 1;
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

geo.Face.prototype.toList = function() {
    var l = ['f', this.a, this.b, this.c];
    if (this.d)
        l.push(this.d);
    return l;
}

geo.Face.prototype.toString = function() {
    return 'f ' + this.a + ' ' + this.b + ' ' + this.c + (this.d ? ' ' + this.d : '');
}

module.exports = geo;
