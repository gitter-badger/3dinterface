var mesh_number = 25;
var renderer, scene, controls, cube, container, plane, mouse= {x:0, y:0};
var bigmesh;
var raycaster;
var objects = [];
var cameras = new CameraContainer();
var spheres = new Array(mesh_number);
var visible = 0;
var stats;

var loader;

var container_size = {width: 1067, height: 600};

init();
animate();

function init() {
    // on initialise le moteur de rendu
    container = document.getElementById('container');
    container.style.height = container_size.height + 'px';
    container.style.width = container_size.width + 'px';
    renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setSize(container_size.width, container_size.height);
    renderer.shadowMapEnabled = true;
    renderer.setClearColor(0x87ceeb);
    renderer.sortObjects = false

    // on initialise la scène
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();

    // Create stats counter
    stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.cssFloat = "top-left";
    container.appendChild( stats.domElement );
    container.appendChild(renderer.domElement);

    // init light
    var directional_light = new THREE.DirectionalLight(0xaaaaaa);
    directional_light.position.set(1, 0.5, 1).normalize();
    directional_light.castShadow = true;
    scene.add(directional_light);

    var ambient_light = new THREE.AmbientLight(0x666666);
    scene.add(ambient_light);

    // on initialise la camera que l’on place ensuite sur la scène
    var camera1 = new PointerCamera(50, container_size.width / container_size.height, 0.01, 100000, container);
    camera1.speed = 0.001;
    camera1.position = new THREE.Vector3(0,2,0);
    camera1.phi = -0.1;
    scene.add(camera1);
    cameras.push(camera1);

    var loader = new THREE.OBJMTLLoader();

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    // THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
    var loader = new THREE.OBJMTLLoader();
        loader.load( '/data/castle/princess peaches castle (outside).obj',
                 '/data/castle/princess peaches castle (outside).mtl',
    function ( object ) {
        object.up = new THREE.Vector3(0,0,1);
        scene.add(object);
        object.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.geometry.mergeVertices();
                object.geometry.computeVertexNormals();
                object.material.side = THREE.DoubleSide;
                if (object.material.name === 'Material.103_princess_peaches_cast') {
                    console.log(object.material.name);
                    object.material.transparent = true;
                }
            }
        });
    }, onProgress, onError );

    loader.load( '/data/first/Floor 1.obj',
                 '/data/first/Floor 1.mtl',
    function ( object ) {
        object.position.z -= 10.9;
        object.position.y += 0.555;
        object.position.x += 3.23;

        var theta = 0.27;
        object.rotation.y = Math.PI - theta;

        object.up = new THREE.Vector3(0,0,1);
        scene.add(object);
        object.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.material.side = THREE.DoubleSide;
                console.log(object.geometry.vertices.length);
                object.geometry.mergeVertices();
                object.geometry.computeVertexNormals();
                if (object.material.name === 'Material.054_777F0E0B_c.bmp' ||
                    object.material.name === 'Material.061_5C3492AB_c.bmp'   ) {
                    object.material.transparent = true;
                }
            }
        });
    }, onProgress, onError );


    createCamera(
            new THREE.Vector3(-3.349895207953063, 5.148106346852601, 0.3365943929701533),
            new THREE.Vector3(13.114421714865292, -7.783476327687569, -33.74713248359852)
    );

    createCamera(
            new THREE.Vector3(4.659399030971226, 0.018674883050052597, -2.578139604982815),
            new THREE.Vector3(-24.57865295128155, -14.475635296016854, -25.70931529313326)
    );

    createCamera(
            new THREE.Vector3(2.625389073616235, 1.2252620948239699, -4.818718135555419),
            new THREE.Vector3(-19.756833131355208, -16.20027570329664, -33.02132017177813)
    );

    createCamera(
            new THREE.Vector3(1.3304975149911331, 0.4836093721106701, -8.60618907952783),
            new THREE.Vector3(-1.7713635815431914, 6.271997833695163, -48.06341930106774)
    );

    createCamera(
            new THREE.Vector3(1.2976081760482443, 1.1520399813234647, -10.258148122402845),
            new THREE.Vector3(-26.00651734173549, -9.19681009597505, -37.596510029925945)
    );

    createCamera(
            new THREE.Vector3(0.15727187830660858, 2.7251137440572855, -5.84333603646124),
            new THREE.Vector3(19.33738702531091, -13.614383891308975, -36.91010284556961)
    );

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mousedown', click, false);

    // Load the scene
    loadScene();


}

function createCamera(position, target) {
    var camera = new FixedCamera(
            50,
            container_size.width / container_size.height,
            1,
            100000,
            position,
            target
    );

    camera.addToScene(scene);
    cameras.push(camera);

}

function loadScene() {

}

function animate() {
    // on appelle la fonction animate() récursivement à chaque frame
    requestAnimationFrame(animate);

    stats.begin();
    cameras.update(cameras.mainCamera().position);
    cameras.look();

    renderer.render(scene, cameras.mainCamera());
    stats.end();
}

function onWindowResize() {
    cameras.forEach(function(camera) {camera.aspect = container.offsetWidth / container.offsetHeight;});
    cameras.forEach(function(camera) {camera.updateProjectionMatrix();});

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.render(scene, cameras.mainCamera());
}

function hide(object) {
    object.traverse(function(object) {object.visible = false;});
}

function show(object) {
    object.traverse(function(object) {object.visible = true;});
}

function click(event) {
    var mouse = {
        x:   ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width ) * 2 - 1,
        y: - ((event.clientY - renderer.domElement.offsetTop)  / renderer.domElement.height) * 2 + 1
    }

    // Show all cameras
    // cameras.map(show);

    var camera = cameras.mainCamera();


    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);

    raycaster.set(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(scene.children, true);

    if ( intersects.length > 0 ) {
        var minDistance;
        var bestIndex;

        // Looking for cameras
        for (i in intersects) {
            if ((intersects[i].distance > 0.5 && minDistance === undefined) || (intersects[i].distance < minDistance )) {
                // We will not consider a line as clickable
                if (! (intersects[i].object instanceof THREE.Line)) {
                    if (!(intersects[i].object instanceof THREE.Mesh && intersects[i].object.material.opacity < 0.1)) {
                        minDistance = intersects[i].distance;
                        bestIndex = i;
                    }
                }
            }
        }

        if (bestIndex !== undefined) {
            if (cameras.getById(intersects[bestIndex].object.id) !== undefined) {
                var new_camera = cameras.getById(intersects[bestIndex].object.id);
                // hide(new_camera);
                cameras.get(0).move(new_camera);
            }
        }

        // Looking for objects
        for (o in objects) {
            if ( intersects[bestIndex].object.id == objects[o].id && cameras.get(objects[o].seen_by[0]) !== undefined) {
                var new_camera = cameras.get(objects[o].seen_by[0]);
                cameras.get(0).move(new_camera);
                break;
            }
        }
    }

    // var pos = cameras.mainCamera().position;
    // var target = cameras.mainCamera().target
    // console.log("Position = ", pos.x, pos.y, pos.z);
    // console.log("Target   = ", target.x, target.y, target.z);
}
