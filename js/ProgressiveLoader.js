var ProgressiveLoader = function(res, scene) {
    // Create mesh
    var geometry = new THREE.Geometry();
    geometry.dynamic = true;

    var material = new THREE.MeshLambertMaterial();
    material.color.setRGB(1,0,0);
    material.side = THREE.DoubleSide;

    var mesh = new THREE.Mesh(geometry, material);
    mesh.up = new THREE.Vector3(0,0,1);

    var added = false;
    var finished = false;

    var socket = io();

    // Init streaming with socket
    socket.emit('request', res);

    // When server's ready, start asking for the mesh
    socket.on('ok', function() {
        socket.emit('next');
    });

    // When receiving elements
    socket.on('elements', function(arr) {

        if (!finished) {
            socket.emit('next');
        }

        // Launch this code in async
        setTimeout(function() {

            // We'll receive an array of string (obj)
            for (var i = 0; i < arr.length; i++) {

                var elts = arr[i];

                // console.log(line);

                if (elts[0] === 'v') {

                    mesh.geometry.vertices.push(new THREE.Vector3(
                        elts[1],
                        elts[2],
                        elts[3]
                    ));

                    mesh.geometry.verticesNeedUpdate = true;

                } else if (elts[0] === 'f') {

                    if (elts[4])
                        elts[4] = parseInt(elts[4]);

                    mesh.geometry.faces.push(new THREE.Face3(
                        elts[1],
                        elts[2],
                        elts[3]
                    ));

                    // If the face has 4 vertices, create second triangle
                    if (elts[4]) {

                        mesh.geometry.faces.push(new THREE.Face3(
                            elts[1],
                            elts[3],
                            elts[4]
                        ));

                    }

                    // Add mesh to scene one there are a few faces in it
                    if (!added) {
                        scene.add(mesh);
                        added = true;
                    }

                }

            }

            mesh.geometry.computeFaceNormals();
            mesh.geometry.groupsNeedUpdate = true;
            mesh.geometry.elementsNeedUpdate = true;
            mesh.geometry.normalsNeedUpdate = true;

        },0);
    });

    socket.on('disconnect', function() {
        console.log("Finished");
        finished = true;
    });

    return mesh;
}
