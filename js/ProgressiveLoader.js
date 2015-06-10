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

        // We'll receive an array of string (obj)
        for (var i = 0; i < arr.length; i++) {

            var line = arr[i];

            // console.log(line);

            if (line[0] === 'v') {

                var elts = line.split(' ');

                mesh.geometry.vertices.push(new THREE.Vector3(
                    parseFloat(elts[1]),
                    parseFloat(elts[2]),
                    parseFloat(elts[3])
                ));

                mesh.geometry.verticesNeedUpdate = true;

            } else if (line[0] === 'f') {

                var elts = line.split(' ');

                elts[1] = parseInt(elts[1]) - 1;
                elts[2] = parseInt(elts[2]) - 1;
                elts[3] = parseInt(elts[3]) - 1;

                if (elts[4])
                    elts[4] = parseInt(elts[4]) - 1;

                mesh.geometry.faces.push(new THREE.Face3(
                    parseInt(elts[1]),
                    parseInt(elts[2]),
                    parseInt(elts[3])
                ));

                // If the face has 4 vertices, create second triangle
                if (elts[4]) {

                    mesh.geometry.faces.push(new THREE.Face3(
                        parseInt(elts[1]),
                        parseInt(elts[3]),
                        parseInt(elts[4])
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

        if (!finished) {
            socket.emit('next');
        } else {
            console.log("Finished");
        }
    });

    socket.on('finished', function(arg) {
        finished = true;
        mesh.faceNumber = arg;
        //mesh.geometry.computeFaceNormals();
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.groupsNeedUpdate = true;
        mesh.geometry.elementsNeedUpdate = true;
        mesh.geometry.morphTargetsNeedUpdate = true;
        mesh.geometry.uvsNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;
        mesh.geometry.colorsNeedUpdate = true;
        mesh.geometry.tangentsNeedUpdate = true;

        // scene.add(mesh);
    });

    return mesh;
}
