var ProgressiveLoader = function(path, scene, materialCreator) {
    // Create mesh
    var obj = new THREE.Object3D();
    obj.up = new THREE.Vector3(0,0,1);
    glob = obj;

    var currentMesh;
    var currentMaterial;

    var added = false;
    var finished = false;

    var socket = io();

    var vertices = [];
    var textCoords = [];
    var uvs = [];
    var faces = [];

    // Init streaming with socket
    socket.emit('request', path);

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

                    vertices.push(new THREE.Vector3(
                        elts[1],
                        elts[2],
                        elts[3]
                    ));

                    verticesNeedUpdate = true;

                } else if (elts[0] === 'vt') {

                    textCoords.push(new THREE.Vector2(
                        elts[1],
                        elts[2]
                    ));

                } else if (elts[0] === 'f') {

                    faces.push(new THREE.Face3(
                        elts[1],
                        elts[2],
                        elts[3]
                    ));

                    // If the face has 4 vertices, create second triangle
                    if (elts.length === 5 || elts.length === 9) {

                        faces.push(new THREE.Face3(
                            elts[1],
                            elts[3],
                            elts[4]
                        ));

                    }

                    // Add texture
                    if (elts.length === 7 || elts.length === 9) {
                        uvs.push([
                            textCoords[elts[4]],
                            textCoords[elts[5]],
                            textCoords[elts[6]]
                        ]);
                    }

                    if (elts.length === 9) {
                        uvs.push([
                            textCoords[elts[5]],
                            textCoords[elts[7]],
                            textCoords[elts[8]]
                        ]);
                    }

                    // Add currentMesh to scene one there are a few faces in it
                    if (!added) {
                        scene.add(obj);
                        added = true;
                    }

                    if (!currentMesh) {
                        var geo = new THREE.Geometry();
                        geo.vertices = vertices;
                        geo.faces = faces;

                        var material;
                        if (currentMaterial === undefined || currentMaterial === null) {
                            material = new THREE.MeshLambertMaterial({color: 'red'});
                        } else {
                            material = materialCreator.create(currentMaterial);
                            currentMaterial = null;
                        }
                        currentMesh = new THREE.Mesh(geo, material);
                    }
                    obj.add(currentMesh);

                } else if (elts[0] === 'u') {

                    // Add current mesh
                    // if (currentMesh) {
                    //     obj.add(currentMesh);
                    // }

                    // Prepare new mesh
                    faces = [];
                    uvs = [];
                    // currentMesh.geometry.computeFaceNormals();
                    if (currentMesh) {
                        currentMesh.geometry.groupsNeedUpdate = true;
                        currentMesh.geometry.elementsNeedUpdate = true;
                        currentMesh.geometry.normalsNeedUpdate = true;
                        currentMesh.geometry.uvsNeedUpdate = true;
                    }
                    currentMaterial = elts[1];
                    currentMesh = null;

                    // console.log(material.map);
                    // currentMesh = new THREE.Mesh(geo, material);

                }

            }

            if (currentMesh) {
                currentMesh.geometry.computeFaceNormals();
                currentMesh.geometry.groupsNeedUpdate = true;
                currentMesh.geometry.elementsNeedUpdate = true;
                currentMesh.geometry.normalsNeedUpdate = true;
                currentMesh.geometry.uvsNeedUpdate = true;
            }

        },0);
    });

    socket.on('disconnect', function() {
        console.log("Finished");
        finished = true;
    });

    return obj;
}
