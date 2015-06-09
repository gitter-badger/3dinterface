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

    var socket = io.connect('http://3dinterface.no-ip.org:8080');

    socket.emit('request', res);

    socket.on('vertex', function(arr) {
        mesh.geometry.vertices[arr[0]] = new THREE.Vector3(arr[1], arr[2], arr[3]);
        mesh.geometry.verticesNeedUpdate = true;
    });

    socket.on('face', function(arr) {
        mesh.geometry.faces.push(new THREE.Face3(arr[0], arr[1], arr[2]));

        if (arr[0] >= mesh.geometry.vertices.length
            || arr[1] >= mesh.geometry.vertices.length
            || arr[2] >= mesh.geometry.vertices.length) {

            console.log("Error");
        }

        if (arr[3])
            mesh.geometry.faces.push(new THREE.Face3(arr[0], arr[2], arr[3]));

        if (!added) {
            scene.add(mesh);
            added = true;
        }

        // Compute the normal

        mesh.geometry.computeFaceNormals();
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.groupsNeedUpdate = true;
        mesh.geometry.elementsNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;

        if (mesh.faceNumber && mesh.faceNumber === mesh.geometry.faces.length) {
            console.log("Finished");
        }
    });

    socket.on('finished', function(arg) {
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
