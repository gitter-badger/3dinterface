var mesh_number = 25;
var renderer, scene, controls, cube, container, plane, mouse= {x:0, y:0};
var bigmesh;
var raycaster;
var objects = [];
var cameras = new CameraContainer();
var spheres = new Array(mesh_number);
var visible = 0;

var loader;

var container_size = new Object();
container_size.width = 1067;
container_size.height = 600;

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
    renderer.setClearColor(0x000000);
    document.getElementById('container').appendChild(renderer.domElement);

    // on initialise la scène
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();

    // init light
    var directional_light = new THREE.DirectionalLight(0x444444);
    directional_light.position.set(1, 0.5, 1).normalize();
    directional_light.castShadow = true;
    scene.add(directional_light);

    var ambient_light = new THREE.AmbientLight(0x666666);
    scene.add(ambient_light);

    // on initialise la camera que l’on place ensuite sur la scène
    var camera1 = new PointerCamera(50, container_size.width / container_size.height, 1, 100000);
    camera1.position.z = 1500;
    scene.add(camera1);
    cameras.push(camera1);

    var camera3 = new FixedCamera(
            50,
            container_size.width / container_size.height,
            1,
            100000,
            new THREE.Vector3(500,0,500),
            new THREE.Vector3(0,0,0)
    );

    camera3.addToScene(scene);
    cameras.push(camera3);

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mousedown', click, false);

    // Création d'un objloader
    var helper = new THREE.LoadingManager();
    helper.onProgress = function(item, loaded, total) {
        console.log(item, ": " , loaded, " / ", total);
    };

    loader = new THREE.OBJLoader(helper);
    loader.load('mesh/TheCarnival.obj', function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.up = new THREE.Vector3(0,0,1);
                child.rotation.x = Math.PI / 2;
                child.scale.set(0.05,0.05,0.05);
            }
        });
        scene.add(object);
    });
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
    cameras.nextCamera();
}
