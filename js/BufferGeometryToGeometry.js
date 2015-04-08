var toGeometry = function (bg) {
    // The following snipped is from Mattatz - Masatatsu Nakamura http://mattatz.org
    var attrib = bg.getAttribute('position');
    if(attrib === undefined) {
        throw new Error('a given BufferGeometry object must have a position attribute.');
    }

    var positions = attrib.array;

    var vertices = [];

    for(var i = 0, n = positions.length; i < n; i += 3) {
        var x = positions[i];
        var y = positions[i + 1];
        var z = positions[i + 2];
        vertices.push(new THREE.Vector3(x, y, z));
    }

    var faces = [];

    for(var i = 0, n = vertices.length; i < n; i += 3) {
        faces.push(new THREE.Face3(i, i + 1, i + 2));
    }

    var geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    geometry.faces = faces;
    geometry.computeFaceNormals();
    return geometry;
}
