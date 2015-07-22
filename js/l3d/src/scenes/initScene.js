// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array#answer-2450976
L3D.shuffle = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

L3D.LogFunction = function(a,b) {
    var val = 100*a/b;
    $('.progress-bar').css('width', val+'%').attr('aria-valuenow', val);
    $('#percentage').html(Math.floor(10*val)/10 + '%');
    if (a === b) {
        setTimeout(function() {$('.progress').hide(1000);}, 1000);
    }
};

L3D.addLight = function(scene) {
    var directional_light = new THREE.DirectionalLight(0xdddddd);
    directional_light.position.set(1, 2.5, 1).normalize();
    directional_light.castShadow = false;
    scene.add(directional_light);

    var ambient_light = new THREE.AmbientLight(0x555555);
    scene.add(ambient_light);
};

L3D.initPeachCastle = function(scene, collidableObjects, recommendation, clickable) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/castle/princess peaches castle (outside).obj',
        scene,
        null,
        function(object) {
            if (clickable !== undefined)
                clickable.push(object);
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
        },
        L3D.LogFunction
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

L3D.initPeach = function(camera, scene, coins, clickable, coin_ids) {
    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initPeachCastle(scene, collidableObjects, camera, clickable);

    camera.resetElements = L3D.resetPeachElements();
    camera.collidableObjects = collidableObjects;

    camera.speed = 0.001;
    camera.reset();
    camera.save();

    scene.add(camera);

    var tmp = L3D.generateCoins(L3D.createPeachCoins(), coin_ids);

    for (var i in tmp) {
        coins.push(tmp[i]);
    }

    setTimeout(function() { coins.forEach(function(coin) { coin.addToScene(scene); });}, 1000);

    Coin.init(0.001);
    var recommendations = [];

    return recommendations;
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


L3D.createPeachRecommendations = function(width, height) {
    var recos = [];

    var createRecommendation = function(position, target) {
        return new Recommendation(
            50,
            width / height,
            1,
            100000,
            position,
            target
        );
    };

    recos.push(
        createRecommendation(
            new THREE.Vector3(-4.318087280217455,2.8007613084859253,1.5193437897009336),
            new THREE.Vector3(19.04561491034525,-11.893857635144567,-27.432436709124897)
        ),
         createRecommendation(
            new THREE.Vector3(-6.257935852456958,2.093463399444844,-7.017904350052701),
            new THREE.Vector3(25.88235261144178,-14.928107421416371,-23.669270187358173)
        ),
         createRecommendation(
            new THREE.Vector3(9.807915641060413,1.599662719763407,1.3278972044453563),
            new THREE.Vector3(-16.404678696813406,-19.467671402046243,-20.330065097629618)
        ),
         createRecommendation(
            new THREE.Vector3(8.593027849546461,2.341563400341173,-10.381814971692629),
            new THREE.Vector3(-23.363783342561,-18.42997444113019,1.755130036517576)
        ),
         createRecommendation(
            new THREE.Vector3(6.422879729593868,3.06821771913114,-4.664407524854438),
            new THREE.Vector3(-15.171947266786782,-24.05662912371069,-24.6119921091785)
        ),
         createRecommendation(
            new THREE.Vector3(10.155340138717236,6.631665534350463,-5.574670324070963),
            new THREE.Vector3(-20.721131232754608,-9.966488352174423,-24.839789145555535)
        ),
         createRecommendation(
            new THREE.Vector3(-6.548087435820877,6.193523907010158,-3.627483164733988),
            new THREE.Vector3(16.752484674681824,-11.466024392567634,-30.926268727065203)
        )
    );

    recos.forEach(function(reco) {reco.setSize(0.2);});

    return recos;
};

L3D.initBobombScene = function(scene, collidableObjects, recommendation, clickable) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/bobomb/bobomb battlefeild.obj',
        scene,
        null,
        function(object) {
            if (clickable !== undefined)
                clickable.push(object);
            object.raycastable = true;
            if (object.material.name === 'Material.071_574B138E_c.bmp' ||
                object.material.name === 'Material.070_41A41EE3_c.bmp') {
                THREEx.Transparency.push(object);
            }
        },
        L3D.LogFunction
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

L3D.generateCoins = function(totalCoins, coin_ids) {

    var i = 0;

    if (coin_ids === undefined)
        L3D.shuffle(totalCoins);
    else {

        for (i = 0; i < coin_ids.length; i++) {

            for (var j = 0; j < totalCoins.length; j++) {

                if (coin_ids[i] === totalCoins[j].id) {

                    // Swap i and j
                    var tmp = totalCoins[i];
                    totalCoins[i] = totalCoins[j];
                    totalCoins[j] = tmp;

                }

            }
        }
    }

    var indices = [];
    var coins = [];

    var bound = (coin_ids instanceof Array && coin_ids.length === 0) ? totalCoins.length : 8;

    for (i = 0; i < bound; i++) {
        coins.push(totalCoins[i].coin);
        totalCoins[i].coin.id = totalCoins[i].id;
        indices.push(totalCoins[i].id);
    }

    console.log(bound);

    if (coin_ids === undefined || (coin_ids instanceof Array && coin_ids.length === 0))
        L3D.DB.Private.sendData('/posts/coin-id', {indices : indices});

    return coins;
};

L3D.createBobombRecommendations = function(width, height) {
    var recos = [];

    var createRecommendation = function(position, target) {
        return new Recommendation(
            50,
            width / height,
            1,
            100000,
            position,
            target
        );
    };

    recos.push(
        createRecommendation(
            new THREE.Vector3(22.81974561274774,23.728166674516967,-23.50757340835654),
            new THREE.Vector3(27.45807332015761,4.665400463440239,11.350666083340474)
        ),
        createRecommendation(
            new THREE.Vector3(4.512241856806823,19.542184465749266,-21.6277607809511),
            new THREE.Vector3(-16.322542559288507,6.552211144388629,9.95027512132075)
        ),
        createRecommendation(
            new THREE.Vector3(3.7236872166568786,11.547542009941035,7.743737673292326),
            new THREE.Vector3(11.778234958188895,3.590700880634021,46.107951987185814)
        ),
        createRecommendation(
            new THREE.Vector3(17.51280189401515,22.651733665113007,32.1344270612909),
            new THREE.Vector3(-17.09689080040822,6.202382514300329,20.663244981189692)
        ),
        createRecommendation(
            new THREE.Vector3(-12.00887621348721,25.979463024729398,37.05007506157123),
            new THREE.Vector3(-6.018501236275041,9.054329353511584,1.3057712098552159)
        ),
        createRecommendation(
            new THREE.Vector3(-9.467050533255307,30.088761873923442,28.727671886170505),
            new THREE.Vector3(-39.96888839418932,10.735797300746938,11.549178083317258)
        ),
        createRecommendation(
            new THREE.Vector3(-30.2051081707108,44.36298906887656,35.77746943907231),
            new THREE.Vector3(-16.54652438711394,19.924260316887796,7.208401795672)
        ),
        createRecommendation(
            new THREE.Vector3(-52.44058113318328,27.688845222097196,28.78379753054363),
            new THREE.Vector3(-21.760754138048632,11.37128676599093,8.972550684871294)
        ),
        createRecommendation(
            new THREE.Vector3(-32.51800140864256,30.21720398723899,-2.2695677339908484),
            new THREE.Vector3(-4.161205509090522,12.002869652965245,-23.813247806588592)
        ),
        createRecommendation(
            new THREE.Vector3(-24.869080810307878,24.29489455015078,-48.36061039882109),
            new THREE.Vector3(-16.792809571743753,4.99108388972596,-14.270483721620096)
        ),
        createRecommendation(
            new THREE.Vector3(24.213548666073923,19.67561630411922,-34.50857509027397),
            new THREE.Vector3(35.82557966946029,-3.7247748037464845,-4.21695195820471)
        )
    );

    return recos;

};

L3D.initBobomb = function(camera, scene, coins, clickable, coin_ids) {
    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initBobombScene(scene, collidableObjects, camera, clickable);

    camera.resetElements = L3D.resetBobombElements();
    camera.collidableObjects = collidableObjects;

    camera.speed = 0.005;
    camera.reset();
    camera.save();

    scene.add(camera);

    Coin.init();
    var tmp = L3D.generateCoins(L3D.createBobombCoins(), coin_ids);

    for (var i in tmp) {
        coins.push(tmp[i]);
    }

    var recommendations = L3D.createBobombRecommendations(container_size.width(), container_size.height());

    recommendations.forEach(function(reco) {reco.addToScene(scene);});

    setTimeout(function() { coins.forEach(function(coin) { coin.addToScene(scene); });}, 1000);

    return recommendations;
};

L3D.initWhompScene = function(scene, collidableObjects, recommendation, clickable) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/whomp/Whomps Fortress.obj',
        scene,
        null,
        function(object) {
            if (clickable !== undefined)
                clickable.push(object);
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

        },
        L3D.LogFunction
    );

    loader.load();

    loader.obj.rotation.x = -Math.PI/2;
    loader.obj.rotation.z = Math.PI/2;
    loader.obj.scale.set(0.1,0.1,0.1);

    // loader.getRecommendation = function() {
    //     var ret = loader.recommendation.toList();
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

L3D.createWhompRecommendations = function(width, height) {
    var recos = [];

    var createRecommendation = function(position, target) {
        return new Recommendation(
            50,
            width / height,
            1,
            100000,
            position,
            target
        );
    };

    recos.push(
        createRecommendation(
            new THREE.Vector3(-9.183036772081453,3.0766349039394916,-10.631680881366988),
            new THREE.Vector3(23.306020365359252,-17.647069934844886,0.09162197153512075)
        ),
        createRecommendation(
            new THREE.Vector3(-11.38099373489364,4.5301496570861906,-8.680448599715064),
            new THREE.Vector3(14.218919789700848,-9.33335658285769,18.75033014002037)
        ),
        createRecommendation(
            new THREE.Vector3(-2.989815984700766,4.808626217924975,-10.034026966216151),
            new THREE.Vector3(10.476586340125928,-16.676909597940817,20.90183828968142)
        ),
        createRecommendation(
            new THREE.Vector3(8.739544533019469,4.57426117700506,-10.246457362075027),
            new THREE.Vector3(-7.420839007222124,-3.599225856368915,25.419157921381895)
        ),
        createRecommendation(
            new THREE.Vector3(11.215995865644405,5.100092599462174,5.157320142222007),
            new THREE.Vector3(-17.739835597264776,-0.18398638725505378,-21.92843872759245)
        ),
        createRecommendation(
            new THREE.Vector3(-7.511384733151988,6.569117611729606,13.141669794236272),
            new THREE.Vector3(11.160164249947218,-9.709441800002363,-18.26504544391685)
        ),
        createRecommendation(
            new THREE.Vector3(0.6846182375474082,13.717750177060871,-3.878598405225172),
            new THREE.Vector3(14.749877291524962,-2.4709024675402205,29.886709431324352)
        ),
        createRecommendation(
            new THREE.Vector3(-5.628153398727744,10.292624364958618,-0.15423059405658932),
            new THREE.Vector3(21.830921092510273,-1.2953399806023977,26.523818630177338)
        ),
        createRecommendation(
            new THREE.Vector3(-3.2817952119549387,8.014848779391615,-6.822708271111021),
            new THREE.Vector3(13.01307852868053,-12.339101451861252,23.511988031315184)
        ),
        createRecommendation(
            new THREE.Vector3(7.805400745480024,9.185305503970957,11.919240783005307),
            new THREE.Vector3(-9.777424733344784,-5.603738432878275,-20.8241314870455)
        )
    );

    recos.forEach(function(reco) {reco.setSize(0.2);});
    return recos;
};

L3D.resetWhompElements = function() {
    return {
        position : new THREE.Vector3(-6.725817925071645,1.4993570618328055,-10.356480813212423),
        target : new THREE.Vector3(-4.8541705829784604,1.3192268872752742,-6.825972443720941)
    };
};

L3D.initWhomp = function(recommendation, scene, coins, clickable, coin_ids) {
    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initWhompScene(scene, collidableObjects, recommendation, clickable);

    recommendation.resetElements = L3D.resetWhompElements();
    recommendation.collidableObjects = collidableObjects;

    recommendation.speed = 0.002;
    recommendation.reset();
    recommendation.save();

    scene.add(recommendation);

    Coin.init(0.002);
    var tmp = L3D.generateCoins(L3D.createWhompCoins(), coin_ids);

    for (var i in tmp) {
        coins.push(tmp[i]);
    }

    var recommendations = L3D.createWhompRecommendations(container_size.width(), container_size.height());

    recommendations.forEach(function(reco) {reco.addToScene(scene);});

    setTimeout(function() { coins.forEach(function(coin) { coin.addToScene(scene); });}, 1000);

    return recommendations;
};

L3D.initMountainScene = function(scene, collidableObjects, recommendation, clickable) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/mountain/coocoolmountain.obj',
        scene,
        null,
        function(object) {
            // object.rotation.x = -Math.PI/2;
            // object.rotation.z = Math.PI/2;
            if (clickable !== undefined)
                clickable.push(object);
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
        },
        L3D.LogFunction
    );

    loader.load();
    collidableObjects.push(loader.obj);
};

L3D.createMountainRecommendations = function(width, height) {
    var recos = [];

    var createRecommendation = function(position, target) {
        return new Recommendation(
            50,
            width / height,
            1,
            100000,
            position,
            target
        );
    };

    recos.push(
        createRecommendation(
            new THREE.Vector3(-32.55470573684094,29.55322138048939,-17.59574199842915),
            new THREE.Vector3(-2.6530082773148784,13.825746134447998,3.8176886333992925)
        ),
        createRecommendation(
            new THREE.Vector3(12.100158831224025,26.077021046580555,-23.46706423961512),
            new THREE.Vector3(-13.67308964482135,11.574392013301521,3.4664356093669397)
        ),
        createRecommendation(
            new THREE.Vector3(16.801072439731502,20.09189357317027,14.011145351254608),
            new THREE.Vector3(-13.195470192683612,-4.443428210365667,4.1002717732066145)
        ),
        createRecommendation(
            new THREE.Vector3(-16.879597154353956,28.027328987174787,23.2120994633039),
            new THREE.Vector3(-6.922498345966725,7.02598138495819,-9.342463691665415)
        ),
        createRecommendation(
            new THREE.Vector3(24.007103291390404,-10.579535956547192,-30.14734612569218),
            new THREE.Vector3(5.7117612503958135,-23.76440846717267,2.8895967789043198)
        ),
        createRecommendation(
            new THREE.Vector3(-12.257327932010769,-12.526038797341444,-36.05191812094985),
            new THREE.Vector3(0.19983861525745894,-20.375474197075437,1.1395508675026633)
        ),
        createRecommendation(
            new THREE.Vector3(16.426221516558684,4.064315972012067,-19.84262328062327),
            new THREE.Vector3(-16.71831968665397,-6.887503610208118,-0.3106741646994493)
        ),
        createRecommendation(
            new THREE.Vector3(44.96685545730114,-6.205815468014633,-0.5730193999373548),
            new THREE.Vector3(7.154826082461277,-13.661034435943513,10.135395267812534)
        ),
        createRecommendation(
            new THREE.Vector3(-33.00196818869413,20.41721604790279,38.566026084656386),
            new THREE.Vector3(-11.64931778228043,-1.846673249080439,13.102649364489118)
        ),
        createRecommendation(
            new THREE.Vector3(-53.183958472088925,-8.39869666868559,28.102017801758063),
            new THREE.Vector3(-15.679778341058253,-11.462793205152831,14.53559656716515)
        ),
        createRecommendation(
            new THREE.Vector3(27.528666741865862,-9.63536430265764,46.43021804402408),
            new THREE.Vector3(1.1519844626168592,-18.896564555304533,17.820765028981576)
        )
    );

    return recos;
};

L3D.resetMountainElements = function() {
    return {
        position : new THREE.Vector3(-20.558328115300082,23.601312087942762,-10.220633604814038),
        target : new THREE.Vector3(11.025356711105232,11.969889531789319,11.393733425161644)
    };
};

L3D.initMountain = function(recommendation, scene, coins, clickable, coin_ids) {
    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initMountainScene(scene, collidableObjects, recommendation, clickable);

    recommendation.resetElements = L3D.resetMountainElements();
    recommendation.collidableObjects = collidableObjects;

    recommendation.speed = 0.005;
    recommendation.reset();
    recommendation.save();

    scene.add(recommendation);

    Coin.init();
    var tmp = L3D.generateCoins(L3D.createMountainCoins(), coin_ids);

    for (var i in tmp) {
        coins.push(tmp[i]);
    }

    var recommendations = L3D.createMountainRecommendations(container_size.width(), container_size.height());

    recommendations.forEach(function(reco) {reco.addToScene(scene);});

    setTimeout(function() { coins.forEach(function(coin) { coin.addToScene(scene); });}, 1000);
    return recommendations;
};

L3D.initSponzaScene = function(scene, collidableObjects, recommendation, clickable) {

    var loader = new L3D.ProgressiveLoader(
        '/static/data/sponza/sponza.obj',
        scene,
        recommendation,
        function(obj) {
            if (clickable !== undefined)
                clickable.push(obj);
            if (obj.material.name === 'chain' ||
                obj.material.name === 'leaf'  ||
                obj.material.name === 'Material__57') {

                THREEx.Transparency.push(obj);

            }

            obj.raycastable = true;

        },
        L3D.LogFunction
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

L3D.createSponzaRecommendations = function() {
    return [];
};

L3D.resetSponzaElements = function() {
    return {
        position: new THREE.Vector3(92.98373669520107,60.8877777990862,11.130138641670737),
        target: new THREE.Vector3(53.76696417668598,56.09739213575453,4.877382575136091)
    };
};

L3D.initSponza = function(recommendation, scene, coins, clickable) {

    L3D.addLight(scene);

    var collidableObjects = [];
    L3D.initSponzaScene(scene, collidableObjects, recommendation, clickable);

    recommendation.resetElements = L3D.resetSponzaElements();
    recommendation.collidableObjects = collidableObjects;

    recommendation.speed = 0.05;
    recommendation.reset();
    recommendation.save();

    scene.add(recommendation);

    Coin.init();
    var tmp = L3D.createSponzaCoins();

    for (var i in tmp) {
        coins.push(tmp[i]);
    }

    var recommendations = L3D.createSponzaRecommendations(container_size.width(), container_size.height());

    recommendations.forEach(function(reco) {reco.addToScene(scene);});

    setTimeout(function() { coins.forEach(function(coin) { coin.addToScene(scene); });}, 1000);


    return recommendations;

};
