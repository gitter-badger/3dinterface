var meshNumber = 25;
var renderer, scene, controls, cube, container, plane, mouse= {x:0, y:0}, sphere, sphereLoader;
var bigmesh;
var raycaster;
var objects = [];
var spheres = new Array(meshNumber);
var visible = 0;
var previousTime;
var loader;

var containerSize = {width: 1067, height: 600};

init();
animate();

function init() {
    // on initialise le moteur de rendu
    container = document.getElementById('container');
    container.style.height = containerSize.height + 'px';
    container.style.width = containerSize.width + 'px';
    renderer = new THREE.WebGLRenderer({alpha:"true"});
    renderer.setSize(containerSize.width, containerSize.height);
    renderer.shadowMapEnabled = true;
    // renderer.setClearColor(0x000000);
    document.getElementById('container').appendChild(renderer.domElement);

    // on initialise la scène
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();

    // init light
    var directionalLight = new THREE.DirectionalLight(0x999999);
    directionalLight.position.set(1, 0.5, 1).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    // on initialise la camera que l’on place ensuite sur la scène
    camera = new L3D.Camera(50, containerSize.width / containerSize.height, 1, 100000);
    scene.add(camera);

    window.addEventListener('resize', onWindowResize, false);

    // Load the scene
    // loader = new THREE.OBJLoader();
    sphereLoader = new L3D.ProgressiveLoader('/static/data/spheres/' + params.get.res + '.obj', scene, null);
    sphereLoader.load();
    sphere = sphereLoader.obj;

    plane = new L3D.Plane(1000,1000);
    plane.translate(0,0,-100);
    plane.addToScene(scene);


    setInterval(animate, 20);
}

function animate() {
    // requestAnimationFrame(animate);

    var currentTime = Date.now() - previousTime;
    camera.update(isNaN(currentTime) ? 20 : currentTime);
    previousTime = Date.now();
    camera.look();

    // sphere.addFace();

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.render(scene, camera);
}

function hide(object) {
    object.traverse(function(object) {object.visible = false;});
}

function show(object) {
    object.traverse(function(object) {object.visible = true;});
}

function click(event) {
    // Nope
}
