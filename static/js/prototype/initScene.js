// Define Recommendation if not defined
var Recommendation = Recommendation || FixedCamera;

function initPeachCastle(scene, collidableObjects, loader, static_path) {
    // Create loader if not already done
    if (loader === undefined) {
        loader = new THREE.OBJMTLLoader();
    }

    // Try to guess the path to static files
    if (static_path === undefined) {
        static_path = "/static/";
    }

    loader.load(
        static_path + 'data/castle/princess peaches castle (outside).obj',
        static_path + 'data/castle/princess peaches castle (outside).mtl',
        function ( object ) {
            object.up = new THREE.Vector3(0,0,1);
            scene.add(object);
            collidableObjects.push(object);
            object.traverse(function (object) {
                if (object instanceof THREE.Mesh) {
                    object.geometry.mergeVertices();
                    object.geometry.computeVertexNormals();
                    object.material.side = THREE.DoubleSide;
                    object.raycastable = true;
                    if (object.material.name === 'Material.103_princess_peaches_cast') {
                        object.material.transparent = true;
                    }
                }
            });
        }
    );

    loader.load(
        static_path + 'data/first/Floor 1.obj',
        static_path + 'data/first/Floor 1.mtl',
        function ( object ) {
            object.position.z -= 10.9;
            object.position.y += 0.555;
            object.position.x += 3.23;

            var theta = 0.27;
            object.rotation.y = Math.PI - theta;

            object.up = new THREE.Vector3(0,0,1);
            scene.add(object);
            collidableObjects.push(object);
            object.traverse(function (object) {
                if (object instanceof THREE.Mesh) {
                    object.material.side = THREE.DoubleSide;
                    object.geometry.mergeVertices();
                    object.geometry.computeVertexNormals();
                    object.raycastable = true;
                    if (object.material.name === 'Material.054_777F0E0B_c.bmp' ||
                        object.material.name === 'Material.061_5C3492AB_c.bmp'   ) {
                        object.material.transparent = true;
                    }
                }
            });
        }
    );
}


function createPeachCameras(width, height) {
    var cams = [];

    var createCamera = function(position, target) {
        return new Recommendation(
            50,
            width / height,
            1,
            100000,
            position,
            target
        );
    }

    cams.push(createCamera(
            new THREE.Vector3(-3.349895207953063, 5.148106346852601, 0.3365943929701533),
            new THREE.Vector3(13.114421714865292, -7.783476327687569, -33.74713248359852)
    ));

    cams.push(createCamera(
            new THREE.Vector3(4.659399030971226, 1.018674883050052597, -2.578139604982815),
            new THREE.Vector3(-16.08800293200113, -28.8795632312717, -19.165379404919797)
    ));

    cams.push(createCamera(
            new THREE.Vector3(2.625389073616235, 1.2252620948239699, -4.818718135555419),
            new THREE.Vector3(-19.756833131355208, -16.20027570329664, -33.02132017177813)
    ));

    cams.push(createCamera(
            new THREE.Vector3(1.3304975149911331, 0.4836093721106701, -8.60618907952783),
            new THREE.Vector3(-1.7713635815431914, 6.271997833695163, -48.06341930106774)
    ));

    cams.push(createCamera(
            new THREE.Vector3(1.2976081760482443, 1.1520399813234647, -10.258148122402845),
            new THREE.Vector3(-26.00651734173549, -9.19681009597505, -37.596510029925945)
    ));

    cams.push(createCamera(
            new THREE.Vector3(0.15727187830660858, 2.7251137440572855, -5.84333603646124),
            new THREE.Vector3(19.33738702531091, -13.614383891308975, -36.91010284556961)
    ));

    return cams;
}

function initBobombScene(scene, loader, static_path) {
    // Create loader if not already done
    if (loader === undefined) {
        loader = new THREE.OBJMTLLoader();
    }

    // Try to guess the path to static files
    if (static_path === undefined) {
        static_path = "/static/";
    }

    loader.load(
        static_path + 'data/bobomb/bobomb battlefeild.obj',
        static_path + 'data/bobomb/bobomb battlefeild.mtl',
        function ( object ) {
            // object.position.z -= 10.9;
            // object.position.y += 0.555;
            // object.position.x += 3.23;

            var theta = 0.27;
            object.rotation.y = Math.PI - theta;

            object.up = new THREE.Vector3(0,0,1);
            collidableObjects.push(object);
            scene.add(object);
            object.traverse(function (object) {
                if (object instanceof THREE.Mesh) {
                    object.material.side = THREE.DoubleSide;
                    console.log(object.geometry.vertices.length);
                    object.geometry.mergeVertices();
                    object.geometry.computeVertexNormals();
                    if (object.material.name === 'Material.071_574B138E_c.bmp' ||
                        object.material.name === 'Material.070_41A41EE3_c.bmp') {
                        object.material.transparent = true;
                    }

                }
            });
        }
    );

    loader.load(
        static_path + 'data/star/GrandStar.obj',
        static_path + 'data/star/GrandStar.mtl',
        function ( object ) {
            object.position.z -= 10.9;
            object.position.y += 0.555;
            object.position.x += 3.23;

            var theta = 0.27;
            object.rotation.y = Math.PI - theta;

            object.up = new THREE.Vector3(0,0,1);
            scene.add(object);
            collidableObjects.push(object);
            object.traverse(function (object) {
                if (object instanceof THREE.Mesh) {
                    object.scale.set(0.005,0.005,0.005);
                    object.position.x = 13;
                    object.position.z = -35;
                    object.position.y = 30;

                    object.rotation.z = Math.PI/2;
                    object.rotation.x = Math.PI/2;
                    object.rotation.y = Math.PI;
                    object.material.side = THREE.DoubleSide;
                    object.geometry.mergeVertices();
                    object.geometry.computeVertexNormals();
                    object.raycastable = true;
                }
            });
        }
   );
}
