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

function resetPeachElements() {
    return {
        position: new THREE.Vector3(-0.18679773265763222,0.20096245470188506,0.19015771599529685),
        target: new THREE.Vector3(-0.18679773265767263,0.20096245470190005,-39.8098422840047)
    };
}

function initZeldaScene(scene, collidableObjects, loader, static_path) {
    // Create loader if not already done
    if (loader === undefined) {
        loader = new THREE.OBJMTLLoader();
    }

    // Try to guess the path to static files
    if (static_path === undefined) {
        static_path = "/static/";
    }

    loader.load(
        static_path + 'data/zelda/Island.obj',
        static_path + 'data/zelda/Island.mtl',
        function ( object ) {
            scene.add(object);
            collidableObjects.push(object);
            object.scale.set(0.01,0.01,0.01);
            object.traverse(function (object) {
                if (object instanceof THREE.Mesh) {
                    object.geometry.mergeVertices();
                    object.geometry.computeVertexNormals();
                    object.material.side = THREE.DoubleSide;
                    object.raycastable = true;
                    if (object.material.name === 'm0') {
                        object.material.transparent = true;
                    }
                }
            });
        }
    );

    // loader.load(
    //     static_path + 'data/zelda/Sea.obj',
    //     static_path + 'data/zelda/Sea.mtl',
    //     function ( object ) {
    //         scene.add(object);
    //         collidableObjects.push(object);
    //         object.scale.set(0.01,0.01,0.01);
    //         object.traverse(function (object) {
    //             if (object instanceof THREE.Mesh) {
    //                 object.geometry.mergeVertices();
    //                 object.geometry.computeVertexNormals();
    //                 object.raycastable = true;
    //             }
    //         });
    //     }
    // );

    // loader.load(
    //     static_path + 'data/zelda/Window Lights.obj',
    //     static_path + 'data/zelda/Window Lights.mtl',
    //     function ( object ) {
    //         scene.add(object);
    //         collidableObjects.push(object);
    //         object.scale.set(0.01,0.01,0.01);
    //         object.traverse(function (object) {
    //             if (object instanceof THREE.Mesh) {
    //                 object.geometry.mergeVertices();
    //                 object.geometry.computeVertexNormals();
    //                 object.raycastable = true;
    //             }
    //         });
    //     }
    // );
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

function resetBobombElements() {
    return {
        position: new THREE.Vector3(-8.849933489419644, 9.050627639459208, 0.6192960680432451),
        target: new THREE.Vector3(17.945323228767702, -15.156828589982375, -16.585740412769756)
    };
}

function createBobombCoins() {
    var coins = [];

    coins.push(
        new Coin(-1.6204001515660262,12.245208850063094,-24.871861611322934),
        new Coin(23.509767766131876,13.6929075780209,-6.1716274892265615),
        new Coin(34.797219873325524,13.088500612704706,-2.1784858128827413),
        new Coin(-23.255456493345882,15.763954882327724,-11.08029248078497),
        new Coin(-7.238094745133173,12.95460420281499,-3.1009487490121885),
        new Coin(-17.10578612221326,24.17871082944758,-11.574224169812915),
        new Coin(-12.418656949661646,17.09780294217035,32.472022253887665),
        new Coin(7.132802719121488,8.802400710545713,22.258165594421055)
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
            new THREE.Vector3(37.24445046448742,17.56004329173052,-13.432945825465112),
            new THREE.Vector3(15.446296842638255,0.7142524861838169,15.568085721947512)
        ),
        createCamera(
            new THREE.Vector3(-24.10987782946019,26.75997424452833,-24.7814217620827),
            new THREE.Vector3(-13.724964120740987,14.939165978074758,11.993869660150779)
        ),
        createCamera(
            new THREE.Vector3(7.162458619916293,18.414234017280627,-10.871480453809644),
            new THREE.Vector3(-27.47061192698706,3.9199238382137196,2.9294396939998144)
        ),
        createCamera(
            new THREE.Vector3(19.741775033926334,14.132046557015727,-25.338452829449857),
            new THREE.Vector3(-18.0898892760213,1.5191520612050162,-28.449733590966297)
        ),
        createCamera(
            new THREE.Vector3(-13.484471970922971,20.25938194278451,-30.850247430073622),
            new THREE.Vector3(-42.04654352929252,-7.608886431102082,-28.099304657929874)
        ),
        createCamera(
            new THREE.Vector3(23.58849177613168,18.628351213754488,31.516769692916675),
            new THREE.Vector3(8.319765065757787,-0.5486703304136178,-0.09189730426033549)
        ),
        createCamera(
            new THREE.Vector3(5.068708131530766,11.201320390433953,9.77462743108436),
            new THREE.Vector3(9.20744154720096,3.8549750522404134,48.87580511010085)
        ),
        createCamera(
            new THREE.Vector3(4.18086580540298,16.54831275414988,29.96253548469186),
            new THREE.Vector3(-17.059296481928556,3.408610856102113,-1.2817238286325505)
        ),
        createCamera(
            new THREE.Vector3(-44.56340663230823,22.567957426093283,14.856920056929788),
            new THREE.Vector3(-20.052660826451827,7.556450599683849,42.67558290835663)
        ),
        createCamera(
            new THREE.Vector3(11.29580093093769,15.03666008708929,31.377195488571406),
            new THREE.Vector3(-28.288314738873957,13.648654387264967,25.794075678265735)
        ),
        createCamera(
            new THREE.Vector3(28.438969076366728,18.888756501203087,26.694456000440766),
            new THREE.Vector3(-5.369166248035665,2.54925886583683,12.909289954623416)
        )
    );

    return cams;

}