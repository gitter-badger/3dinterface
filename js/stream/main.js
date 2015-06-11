var mesh_number = 25;
var renderer, scene, controls, cube, container, plane, mouse= {x:0, y:0}, sphere;
var bigmesh;
var raycaster;
var objects = [];
var spheres = new Array(mesh_number);
var visible = 0;
var previousTime;
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
    camera = new Camera(50, container_size.width / container_size.height, 1, 100000);
    scene.add(camera);

    window.addEventListener('resize', onWindowResize, false);

    // Load the scene
    // loader = new THREE.OBJLoader();
    sphere = ProgressiveLoader('static/data/spheres/' + params.get.res + '.obj', scene);

    plane = new Plane(1000,1000);
    plane.translate(0,0,-100);
    plane.addToScene(scene);

}

function animate() {
    // on appelle la fonction animate() récursivement à chaque frame
    requestAnimationFrame(animate);

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
