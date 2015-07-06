var Recommendation = Recommendation || L3D.ArrowRecommendation;

L3D.addLight = function(scene) {
    var directional_light = new THREE.DirectionalLight(0xdddddd);
    directional_light.position.set(1, 2.5, 1).normalize();
    directional_light.castShadow = false;
    scene.add(directional_light);

    var ambient_light = new THREE.AmbientLight(0x555555);
    scene.add(ambient_light);
};

L3D.initPeachCastle = function(scene, collidableObjects, camera) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/castle/princess peaches castle (outside).obj',
        scene,
        null,
        function(object) {
            object.raycastable = true;
            if (object.material.name === 'Material.103_princess_peaches_cast') {
                THREEx.Transparency.push(object);
            } else if (object.material.name === 'Material.136_princess_peaches_cast' ||
                       object.material.name === 'Material.135_princess_peaches_cast') {
                THREEx.Transparency.push(object);
                object.material.opacity = 0.5;
                object.raycastable = false;
                object.material.side = THREE.FrontSide;
            }
        }
    );
    loader.load();

    collidableObjects.push(loader.obj);
    loader.obj.raycastable = true;
};

L3D.resetPeachElements = function() {
    return {
        position: new THREE.Vector3(0.24120226734236713,0.2009624547018851,-0.5998422840047036),
        target: new THREE.Vector3(0.24120226734232672,0.20096245470190008,-40.5998422840047)
    };
};

L3D.initPeach = function(camera, scene, coins) {
    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initPeachCastle(scene, collidableObjects, camera);

    camera.resetElements = L3D.resetPeachElements();
    camera.collidableObjects = collidableObjects;

    camera.speed = 0.001;
    camera.reset();
    camera.save();

    scene.add(camera);

    Coin.init(0.001);
    var otherCams = [];
    var cameras = new L3D.CameraContainer(camera, otherCams);

    return cameras;
};

L3D.initZeldaScene = function(scene, collidableObjects, loader) {
    // Create loader if not already done
    if (loader === undefined) {
        loader = new THREE.OBJMTLLoader();
    }

    loader.load(
        '/static/data/zelda/Island.obj',
        '/static/data/zelda/Island.mtl',
        function ( object ) {
            collidableObjects.push(object);
            object.scale.set(0.01,0.01,0.01);
            object.traverse(function (object) {
                if (object instanceof THREE.Mesh) {
                    object.geometry.mergeVertices();
                    object.geometry.computeVertexNormals();
                    object.material.side = THREE.DoubleSide;
                    object.raycastable = true;
                    if (object.material.name === 'm0') {
                        THREEx.Transparency.push(object);
                    }
                }
            });
        }
    );

};


L3D.createPeachCameras = function(width, height) {
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
    };

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

    // cams.push(createCamera(
    //         new THREE.Vector3(1.3304975149911331, 0.4836093721106701, -8.60618907952783),
    //         new THREE.Vector3(-1.7713635815431914, 6.271997833695163, -48.06341930106774)
    // ));

    // cams.push(createCamera(
    //        new THREE.Vector3(1.2976081760482443, 1.1520399813234647, -10.258148122402845),
    //        new THREE.Vector3(-26.00651734173549, -9.19681009597505, -37.596510029925945)
    // ));

    cams.push(createCamera(
            new THREE.Vector3(0.15727187830660858, 2.7251137440572855, -5.84333603646124),
            new THREE.Vector3(19.33738702531091, -13.614383891308975, -36.91010284556961)
    ));

    cams.push(createCamera(
        new THREE.Vector3(-3.912436457101955,1.4571795397310319,-7.361700012948173),
        new THREE.Vector3(26.60153755572943,-12.280244389383581,-29.274722938506393)
    ));

    cams.push(createCamera(
        new THREE.Vector3(4.734058048040269,0.9171350442568073,0.12604632828978296),
        new THREE.Vector3(25.163187055614348,-27.08137327531798,-19.842284094421995)
    ));

    cams.forEach(function(cam) {cam.setSize(0.2);});

    return cams;
};

L3D.initBobombScene = function(scene, collidableObjects, camera) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/bobomb/bobomb battlefeild.obj',
        scene,
        null,
        function(object) {
            object.raycastable = true;
            if (object.material.name === 'Material.071_574B138E_c.bmp' ||
                object.material.name === 'Material.070_41A41EE3_c.bmp') {
                THREEx.Transparency.push(object);
            }
        }
    );

    loader.load();
    var theta = 0.27;
    loader.obj.rotation.y = Math.PI - theta;

    loader.obj.up = new THREE.Vector3(0,0,1);
    collidableObjects.push(loader.obj);

};

L3D.resetBobombElements = function() {
    return {
        position: new THREE.Vector3(38.115627509754646,10.829803024792419,-19.862035691341315),
        target: new THREE.Vector3(-1.4518898576752122,5.048214777643772,-18.869661407832535)
    };
};

L3D.createBobombCoins = function() {
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
};

L3D.createBobombCameras = function(width, height) {
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
    };

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

};

L3D.initBobomb = function(camera, scene, coins) {
    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initBobombScene(scene, collidableObjects, camera);

    camera.resetElements = L3D.resetBobombElements();
    camera.collidableObjects = collidableObjects;

    camera.speed = 0.005;
    camera.reset();
    camera.save();

    scene.add(camera);

    Coin.init();
    var tmp = L3D.createBobombCoins();

    for (var i in tmp) {
        coins.push(tmp[i]);
    }

    var otherCams = L3D.createBobombCameras(container_size.width(), container_size.height());
    var cameras = new L3D.CameraContainer(camera, otherCams);

    otherCams.forEach(function(cam) {cam.addToScene(scene);});

    setTimeout(function() { coins.forEach(function(coin) { coin.addToScene(scene); });}, 1000);

    return cameras;
};

L3D.initWhompScene = function(scene, collidableObjects, camera) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/whomp/Whomps Fortress.obj',
        scene,
        null,
        function(object) {
            object.raycastable = true;
            if (object.material.name === 'Shape_088' ||
                object.material.name === 'Shape_089') {
                object.raycastable = false;
            THREEx.Transparency.push(object);
            } else if (object.material.name === 'Shape_113') {
                THREEx.Transparency.push(object);
                object.material.opacity = 0.5;
            } else if (object.material.name === 'Shape_076' ||
                       object.material.name === 'Shape_098' ||
                       object.material.name === 'Shape_092') {
                object.visible = false;
            }

        }
    );

    loader.load();

    loader.obj.rotation.x = -Math.PI/2;
    loader.obj.rotation.z = Math.PI/2;
    loader.obj.scale.set(0.1,0.1,0.1);

    // loader.getCamera = function() {
    //     var ret = loader.camera.toList();
    //     ret[0][0] *= 10;
    //     ret[0][1] *= 10;
    //     ret[0][2] *= 10;

    //     ret[1][0] *= 10;
    //     ret[1][1] *= 10;
    //     ret[1][2] *= 10;

    //     // Planes
    //     for (var i = 2; i < ret.length; i++) {

    //         ret[i][3] *= 10;

    //     }

    //     return ret;
    // };

    collidableObjects.push(loader.obj);
    loader.obj.raycastable = true;
};

L3D.createWhompCameras = function(width, height) {
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
    };

    cams.push(
        createCamera(
            new THREE.Vector3(-5.4336754204569345,3.1392444908865986,-2.5523620854280967),
            new THREE.Vector3(-5.284005453263061, 2.9591143163290674, 1.440776031533807)
        ),
        createCamera(
            new THREE.Vector3(-6.1753139246999424,3.1460450777755153, 8.89776989593906),
            new THREE.Vector3(-2.7026837603414037,3.365743354536376,  6.924809579871983)
        ),
        createCamera(
            new THREE.Vector3(-5.4975217973818246,7.726911253355844,  2.805487210952553),
            new THREE.Vector3(-2.262483559754942, 5.4847179687372005, 2.0933798626524435)
        ),
        createCamera(
            new THREE.Vector3(767.5978415761134,  3.641765617950047, -6.734909128840316),
            new THREE.Vector3(800.1643232028776,  2.192334600043356, -3.0210038861375168)
        ),
        createCamera(
            new THREE.Vector3(-4.521868295112849, 4.598285007581405, -7.186164895937964),
            new THREE.Vector3(-1.2890361546656827,2.964335244044779, -5.489401941978159)
        ),
        createCamera(
            new THREE.Vector3(7.669185389234946,3.470810613964853,-7.254996785427332),
            new THREE.Vector3(11.103044107444248,-8.414196017364398,30.78386796730468)
        ),
        createCamera(
            new THREE.Vector3(-5.00642950829277,7.5887626003253095,-5.785306379113327),
            new THREE.Vector3(30.922081744183423,1.5447833064028265,10.725671589357493)
        ),
        createCamera(
            new THREE.Vector3(10.73348160390988,7.384861575888838,-5.156956944727774),
            new THREE.Vector3(-17.904597948771446,1.3408822819663548,22.107135078094704)
        ),
        createCamera(
            new THREE.Vector3(6.571383420547652,6.592495890455599,8.530692470963302),
            new THREE.Vector3(-17.04673536396069,6.525278678835147,-23.752119471730232)
        ),
        createCamera(
        new THREE.Vector3(-2.658378348430724,9.934059833300438,4.832483419920441),
        new THREE.Vector3(31.687909225501116,1.921420479172772,-14.038927244612823)
        ),
        createCamera(
            new THREE.Vector3(0.32263636932421563,14.77110426329107,-4.846281929349468),
            new THREE.Vector3(13.444429209246985,-2.688018079059324,28.664874417470223)
        )

    );

    cams.forEach(function(cam) {cam.setSize(0.2);});
    return cams;
};

L3D.createWhompCoins = function() {
    return [
        new Coin(-5.529176900669821,2.886514571524507,4.127968972716147),
        new Coin(-3.336263561768484,9.341710952326468,1.0230063543998414),
        new Coin(1.985057515492925,12.151756532082196,1.3355674703297925),
        new Coin(8.100383890535953,4.6489182333624335,1.9132972963126775),
        new Coin(0.6049016864458896,6.2498603432959584,3.6272087520336264),
        new Coin(-1.4497656612870164,6.263594147452652,-4.0488101538390694),
        new Coin(6.753883218882444,2.019245026490682,-7.001046531863012),
        new Coin(3.4354286209455246,3.487313067990168,-4.091947594995703)
    ];
};

L3D.resetWhompElements = function() {
    return {
        position : new THREE.Vector3(-6.725817925071645,1.4993570618328055,-10.356480813212423),
        target : new THREE.Vector3(-4.8541705829784604,1.3192268872752742,-6.825972443720941)
    };
};

L3D.initWhomp = function(camera, scene, coins) {
    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initWhompScene(scene, collidableObjects, camera);

    camera.resetElements = L3D.resetWhompElements();
    camera.collidableObjects = collidableObjects;

    camera.speed = 0.002;
    camera.reset();
    camera.save();

    scene.add(camera);

    Coin.init(0.002);
    var tmp = L3D.createWhompCoins();

    for (var i in tmp) {
        coins.push(tmp[i]);
    }

    var otherCams = L3D.createWhompCameras(container_size.width(), container_size.height());
    var cameras = new L3D.CameraContainer(camera, otherCams);

    otherCams.forEach(function(cam) {cam.addToScene(scene);});

    setTimeout(function() { coins.forEach(function(coin) { coin.addToScene(scene); });}, 1000);

    return cameras;
};

L3D.initMountainScene = function(scene, collidableObjects, camera) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/mountain/coocoolmountain.obj',
        scene,
        null,
        function(object) {
            // object.rotation.x = -Math.PI/2;
            // object.rotation.z = Math.PI/2;
            object.raycastable = true;
            if (object.material.name === 'Material.070_13F025D5_c2.png' ||
                object.material.name === 'Material.068_5972FC88_c.bmp' ||
                object.material.name === 'Material.073_76F611AD_c.bmp' ||
                object.material.name === 'Material.071_76F611AD_c.bmp' ||
                object.material.name === 'Material.072_1723CCC7_c.bmp' ||
                object.material.name === 'Material.069_78B64DC7_c.bmp' ||
                object.material.name === 'Material.070_13F025D5_c.bmp' ||
                object.material.name === 'Material.078_3165B23A_c.bmp' ||
                object.material.name === 'Material.067_1723CCC7_c.bmp' ||
                object.material.name === 'Material.066_36DB292F_c.bmp') {
                THREEx.Transparency.push(object);
            } else if (object.material.name === 'Material.082_6DAF90F6_c.bmp') {
                THREEx.Transparency.push(object);
                object.material.opacity = 0.5;
            }
        }
    );

    loader.load();
    collidableObjects.push(loader.obj);
};

L3D.createMountainCoins = function() {
    return [
        new Coin(-18.766484229298513,-6.174512332611151,16.379061147364553),
        new Coin(-22.48878786991581,-17.698282433679474,1.6030258853572397),
        new Coin(-8.604868977581164,-17.3348862459467,-11.923191659094416),
        new Coin(24.81563047462934,-12.174170400556296,5.612049952487652),
        new Coin(-6.4854226987006305,0.34787283214634307,-17.2093293607182),
        new Coin(-14.50190371481413,20.88721463986533,7.923724946536855),
        new Coin(-13.980787439949077,-0.10719616576499978,22.24889144136683),
        new Coin(4.491305202472262,3.6813420775366277,10.03229664467681)
    ];
};

L3D.createMountainCameras = function(width, height) {
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
    };

    cams.push(
        createCamera(
            new THREE.Vector3(6.390950470631724,17.280677948120072,-10.027673035476619),
            new THREE.Vector3(3.407145269707846,3.751012364771242,27.496253407869986)
        ),
        createCamera(
            new THREE.Vector3(1.8218030281265742,12.868464705566172,23.225042509186405),
            new THREE.Vector3(-35.819191507045865,-0.6612008777826581,22.903049332448994)
        ),
        createCamera(
            new THREE.Vector3(-16.540494685269973,13.110251646113246,22.542769963619342),
            new THREE.Vector3(-27.881799604553773,-2.2838398465862237,-12.59121287126898)
        ),
        createCamera(
            new THREE.Vector3(-22.09255502589394,7.505905597711714,-15.23412829383532),
            new THREE.Vector3(14.823279525934556,-4.1255169584417315,-5.138031589552474)
        ),
        createCamera(
            new THREE.Vector3(-21.665778251110755,4.241815926756635,40.76683432842355),
            new THREE.Vector3(2.62922954212112,-7.389606629396811,11.19552043054259)
        ),
        createCamera(
            new THREE.Vector3(14.384899444452842,4.759647095537105,30.122662109900055),
            new THREE.Vector3(25.246471433793317,-6.871775460616339,-6.575243324069596)
        ),
        createCamera(
            new THREE.Vector3(20.6728438093429,-14.408979127185429,18.889993476410144),
            new THREE.Vector3(-13.929780518638935,-26.04040168333887,35.241397053374556)
        ),
        createCamera(
            new THREE.Vector3(-26.825730322260814,-17.21406097233303,33.188195206615795),
            new THREE.Vector3(-12.326126408723896,-17.015972902810617,-4.090783420316271)
        ),
        createCamera(
            new THREE.Vector3(-41.2311561559715,-11.714721125315961,2.070220579408691),
            new THREE.Vector3(-2.2066012462800373,-15.510910369724881,9.986852522420207)
        ),
        createCamera(
            new THREE.Vector3(24.92926976320075,-11.374119469227288,-21.440813349326792),
            new THREE.Vector3(-7.328902834025087,-24.90378505257612,-2.040853300647978)
        ),
        createCamera(
            new THREE.Vector3(-18.733128013636136,-12.129585933653297,-31.983290996466735),
            new THREE.Vector3(-1.6636179852017818,-25.659251517002126,1.566373332583197)
        ),
        createCamera(
            new THREE.Vector3(-20.627345017019206,22.028686074349515,20.541790520954777),
            new THREE.Vector3(14.150384161446272,11.731784408247087,3.6751557271398525)
        )
    );

    return cams;
};

L3D.resetMountainElements = function() {
    return {
        position : new THREE.Vector3(-20.558328115300082,23.601312087942762,-10.220633604814038),
        target : new THREE.Vector3(11.025356711105232,11.969889531789319,11.393733425161644)
    };
};

L3D.initMountain = function(camera, scene, coins) {
    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initMountainScene(scene, collidableObjects, camera);

    camera.resetElements = L3D.resetMountainElements();
    camera.collidableObjects = collidableObjects;

    camera.speed = 0.005;
    camera.reset();
    camera.save();

    scene.add(camera);

    Coin.init();
    var tmp = L3D.createMountainCoins();

    for (var i in tmp) {
        coins.push(tmp[i]);
    }

    var otherCams = L3D.createMountainCameras(container_size.width(), container_size.height());
    var cameras = new L3D.CameraContainer(camera, otherCams);

    otherCams.forEach(function(cam) {cam.addToScene(scene);});

    setTimeout(function() { coins.forEach(function(coin) { coin.addToScene(scene); });}, 1000);
    return cameras;
};

L3D.initSponzaScene = function(scene, collidableObjects, camera) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/sponza/sponza.obj',
        scene,
        camera,
        function(obj) {
            if (obj.material.name === 'chain' ||
                obj.material.name === 'leaf'  ||
                obj.material.name === 'Material__57') {

                THREEx.Transparency.push(obj);

            }

            obj.raycastable = true;

        }
    );

    l = loader;
    loader.load();


    loader.getCamera = function() {
        var ret = loader.camera.toList();
        ret[0][0] *= 10;
        ret[0][1] *= 10;
        ret[0][2] *= 10;

        ret[1][0] *= 10;
        ret[1][1] *= 10;
        ret[1][2] *= 10;

        // Planes
        for (var i = 2; i < ret.length; i++) {

            ret[i][3] *= 10;

        }

        return ret;
    };
    loader.obj.scale.set(0.1,0.1,0.1);

    collidableObjects.push(loader.obj);
    loader.obj.raycastable = true;



    // ProgressiveLoader('/static/data/sponza/sponza.obj', scene,
    //     function(obj) {
    //         obj.scale.set(0.1,0.1,0.1);
    //         collidableObjects.push(obj);
    //         obj.raycastable = true;

    //         if (obj.material.name === 'chain' ||
    //             obj.material.name === 'leaf'  ||
    //             obj.material.name === 'Material__57') {

    //             THREEx.Transparency.push(obj);
    //         }

    //     }
    // );

};

L3D.createSponzaCoins = function() {
    return [];
};

L3D.createSponzaCameras = function() {
    return [];
};

L3D.resetSponzaElements = function() {
    return {
        position: new THREE.Vector3(92.98373669520107,60.8877777990862,11.130138641670737),
        target: new THREE.Vector3(53.76696417668598,56.09739213575453,4.877382575136091)
    };
};

L3D.initSponza = function(camera, scene, coins) {

    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initSponzaScene(scene, collidableObjects, camera);

    camera.resetElements = L3D.resetSponzaElements();
    camera.collidableObjects = collidableObjects;

    camera.speed = 0.05;
    camera.reset();
    camera.save();

    scene.add(camera);

    Coin.init();
    var tmp = L3D.createSponzaCoins();

    for (var i in tmp) {
        coins.push(tmp[i]);
    }

    var otherCams = L3D.createSponzaCameras(container_size.width(), container_size.height());
    var cameras = new L3D.CameraContainer(camera, otherCams);

    otherCams.forEach(function(cam) {cam.addToScene(scene);});

    setTimeout(function() { coins.forEach(function(coin) { coin.addToScene(scene); });}, 1000);


    return cameras;

};
