// Define RecommendedCamera if not defined
var RecommendedCamera = RecommendedCamera || FixedCamera;

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
        return new RecommendedCamera(
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

function initBobombScene(scene, collidableObjects, loader, static_path) {
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
                    object.raycastable = true;
                    object.material.side = THREE.DoubleSide;
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

    // loader.load(
    //     static_path + 'data/star/GrandStar.obj',
    //     static_path + 'data/star/GrandStar.mtl',
    //     function ( object ) {
    //         object.position.z -= 10.9;
    //         object.position.y += 0.555;
    //         object.position.x += 3.23;

    //         var theta = 0.27;
    //         object.rotation.y = Math.PI - theta;

    //         object.up = new THREE.Vector3(0,0,1);
    //         scene.add(object);
    //         collidableObjects.push(object);
    //         object.traverse(function (object) {
    //             if (object instanceof THREE.Mesh) {
    //                 object.scale.set(0.005,0.005,0.005);
    //                 object.position.x = 13;
    //                 object.position.z = -35;
    //                 object.position.y = 30;

    //                 object.rotation.z = Math.PI/2;
    //                 object.rotation.x = Math.PI/2;
    //                 object.rotation.y = Math.PI;
    //                 object.material.side = THREE.DoubleSide;
    //                 object.geometry.mergeVertices();
    //                 object.geometry.computeVertexNormals();
    //                 object.raycastable = true;
    //             }
    //         });
    //     }
    //);
}

function createBobombCoins() {
    var coins = [];

    coins.push(
        new Coin(30.451451579494677,12.95882671478358,-4.441244895059621),
        new Coin(-23.255456493345882,15.763954882327724,-11.08029248078497),
        new Coin(-7.238094745133173,12.95460420281499,-3.1009487490121885),
        new Coin(-17.10578612221326,24.17871082944758,-11.574224169812915),
        new Coin(-19.696802461559027,29.787916906980758,17.187300848990844),
        new Coin(-12.418656949661646,17.09780294217035,32.472022253887665)
    );

    return coins;
}

function createBobombCameras(width, height) {
    var cams = [];

    var createCamera = function(position, target) {
        return new RecommendedCamera(
            50,
            width / height,
            1,
            100000,
            position,
            target
        );
    }

    cams.push(
        createCamera(
            new THREE.Vector3(-24.10987782946019,26.75997424452833,-24.7814217620827),
            new THREE.Vector3(-13.724964120740987,14.939165978074758,11.993869660150779)
        ),
        createCamera(
            new THREE.Vector3(-13.484471970922971,20.25938194278451,-30.850247430073622),
            new THREE.Vector3(-42.04654352929252,-7.608886431102082,-28.099304657929874)
        ),
        createCamera(
            new THREE.Vector3(23.58849177613168,18.628351213754488,31.516769692916675),
            new THREE.Vector3(8.319765065757787,-0.5486703304136178,-0.09189730426033549)
        )
        // createCamera(
        //     new THREE.Vector3(28.438969076366728,18.888756501203087,26.694456000440766),
        //     new THREE.Vector3(-5.369166248035665,2.54925886583683,12.909289954623416)
        // )
    );

    return cams;

}
