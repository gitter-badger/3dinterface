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

    socket.emit('request', res);

    socket.on('ok', function() {
        socket.emit('next');
    });

    socket.on('vertex', function(arr) {
        // console.log('v(', arr[0], ')', arr[1], arr[2], arr[3]);
        mesh.geometry.vertices[arr[0]] = new THREE.Vector3(arr[1], arr[2], arr[3]);
        mesh.geometry.verticesNeedUpdate = true;
        socket.emit('next');
    });

    socket.on('face', function(arr) {
        // console.log('f', arr[0], arr[1], arr[2]);
        mesh.geometry.faces.push(new THREE.Face3(arr[0], arr[1], arr[2]));

        // if (arr[0] >= mesh.geometry.vertices.length
        //     || arr[1] >= mesh.geometry.vertices.length
        //     || arr[2] >= mesh.geometry.vertices.length) {

        //     console.log("Error");
        // }

        if (arr[3])
            mesh.geometry.faces.push(new THREE.Face3(arr[0], arr[2], arr[3]));

        if (!added) {
            scene.add(mesh);
            added = true;
        }

        // Compute the normal

        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.groupsNeedUpdate = true;
        mesh.geometry.elementsNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;

        if (finished) {
            console.log("Finished");
        } else {
            socket.emit('next');
        }
        mesh.geometry.computeFaceNormals();
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

    socket.on('none', function() {
        socket.emit('next');
    });

    return mesh;
}
