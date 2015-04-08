var mesh_number = 25;
var renderer, scene, controls, cube, container, plane, mouse= {x:0, y:0};
var bigmesh;
var raycaster;
var objects = [];
var cameras = new CameraContainer();
var spheres = new Array(mesh_number);
var visible = 0;

var loader;

var container_size = {width: 1067, height: 600};

init();
animate();

function init() {
    // on initialise le moteur de rendu
    container = document.getElementById('container');
    container.style.height = container_size.height + 'px';
    container.style.width = container_size.width + 'px';
    renderer = new THREE.WebGLRenderer({alpha:"true"});
    renderer.setSize(container_size.width, container_size.height);
    renderer.shadowMapEnabled = true;
    // renderer.setClearColor(0x000000);
    document.getElementById('container').appendChild(renderer.domElement);

    // on initialise la scène
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();

    // init light
    var directional_light = new THREE.DirectionalLight(0x999999);
    directional_light.position.set(1, 0.5, 1).normalize();
    directional_light.castShadow = true;
    scene.add(directional_light);

    var ambient_light = new THREE.AmbientLight(0x333333);
    scene.add(ambient_light);

    // on initialise la camera que l’on place ensuite sur la scène
    var camera1 = new PointerCamera(50, container_size.width / container_size.height, 1, 100000);

    var camera2 = new FixedCamera(50,
        container_size.width / container_size.height,
        1, 100000,
        new THREE.Vector3(707,-247,603),
        new THREE.Vector3(683,-269,580)
    );

    var camera3 = new FixedCamera(50,
        container_size.width / container_size.height,
        1, 100000,
        new THREE.Vector3(727,165,310),
        new THREE.Vector3(693,173,291)
    );

    var camera4 = new FixedCamera(50,
        container_size.width / container_size.height,
        1, 100000,
        new THREE.Vector3(-67,-105,306),
        new THREE.Vector3(-103,-120,314)
    );

    scene.add(camera1);
    cameras.push(camera1);
    cameras.push(camera2);
    cameras.push(camera3);
    cameras.push(camera4);

    camera2.addToScene(scene);
    camera3.addToScene(scene);
    camera4.addToScene(scene);

    // var camera3 = new FixedCamera(
    //         50,
    //         container_size.width / container_size.height,
    //         1,
    //         100000,
    //         new THREE.Vector3(500,0,500),
    //         new THREE.Vector3(0,0,0)
    // );

    // camera3.addToScene(scene);
    // cameras.push(camera3);

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mousedown', click, false);

    // Load the scene
    loadScene();

    plane = new Plane(1000,1000);
    plane.translate(0,0,-100);
    plane.addToScene(scene);

}

function loadScene() {
    var positions = [
        new THREE.Vector3(139.4026786273838,135.5184946130355,398.44068539970607),
        new THREE.Vector3(-435.43466612542625,-213.42817928744614,357.9683852860272),
        new THREE.Vector3(331.55730402813379,-554.75051838788778,327.9545043861335),
        new THREE.Vector3(337.83563114154583,494.02776032947725,91.40149126173162),
        new THREE.Vector3(-483.7218395537484,26.07460345877575,16.1503626453437)
    ];

    var colors = [
        0x5bf9ef,
        0xec5e15,
        0xcac518,
        0x39c8d6,
        0x04da72
    ];

    var seen_by = [
        [],
        [3],
        [1],
        [2],
        [2]
    ];

    var mesh_number = positions.length;

    loader = new THREE.OBJLoader();
    for (var i = 0; i < mesh_number; i++) {
        // Capture of i
        // I am pretty good
        (function(i) {
            var new_id;
            loader.load('/data/spheres/' + (i+1) + '.obj', function (object) {
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh ) {
                        child.material.color.setHex(colors[i]);
                        child.up = new THREE.Vector3(0,0,1);
                        child.geometry.computeVertexNormals();
                        child.translateX(positions[i].x);
                        child.translateY(positions[i].y);
                        child.translateZ(positions[i].z);
                        new_id = child.id;
                    }
                });
                spheres[i] = object;
                scene.add(object);
                objects.push({obj: object, seen_by: seen_by[i], id: new_id});
            });
        })(i);
    }
}

function animate() {
    // on appelle la fonction animate() récursivement à chaque frame
    requestAnimationFrame(animate);

    cameras.update();
    cameras.look();

    renderer.render(scene, cameras.mainCamera());
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
            if ((intersects[i].distance > 50 && minDistance === undefined) || (intersects[i].distance < minDistance )) {
                // We will not consider a line as clickable
                if (! (intersects[i].object instanceof THREE.Line)) {
                    minDistance = intersects[i].distance;
                    bestIndex = i;
                }
            }
        }

        if (bestIndex !== undefined) {
            if (cameras.getById(intersects[bestIndex].object.id) !== undefined) {
                cameras.get(0).move(cameras.getById(intersects[bestIndex].object.id));
            }
        }

        // Looking for objects
        for (o in objects) {
            if ( intersects[bestIndex].object.id == objects[o].id) {
                cameras.get(0).move(cameras.get(objects[o].seen_by[0]));
                break;
            }
        }
    }

    // var pos = cameras.mainCamera().position;
    // var target = cameras.mainCamera().target
    // console.log("Position = ", pos.x, pos.y, pos.z);
    // console.log("Target   = ", target.x, target.y, target.z);
}
