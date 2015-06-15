var mesh_number = 25;
var renderer, scene, camera, controls, cube, container, plane, mouse= {x:0, y:0};
var raycaster;
var objects = [];
var spheres = new Array(mesh_number);
var visible = 0;

var loader, previousTime;

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
    document.getElementById('container').appendChild(renderer.domElement);

    // on initialise la scène
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();

    // init light
    var directional_light = new THREE.DirectionalLight(0xffffff);
    directional_light.position.set(1, 0.5, 1).normalize();
    directional_light.castShadow = true;
    scene.add(directional_light);

    var ambient_light = new THREE.AmbientLight(0x444444);
    scene.add(ambient_light);

    // on initialise la camera que l’on place ensuite sur la scène
    camera = new Camera(50, container_size.width / container_size.height, 1, 10000);
    scene.add(camera);

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mousedown', click, false);

    // Création d'un objloader
    loader = new THREE.OBJLoader();

    for (var i = 0; i < mesh_number; i++) {
        // Capture of i
        // I am pretty good
        (function(i) {
            loader.load(static_path + 'data/spheres/' + (i+1) + '.obj', function (object) {
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh ) {
                        child.material.color.setHex(0xff0000);
                        child.up = new THREE.Vector3(0,0,1);
                        child.geometry.computeFaceNormals();
                        child.geometry.computeVertexNormals();
                    }
                });
                spheres[i] = object;
                scene.add(object);
                if (i != 0)
                    hide(object);
            });
        })(i);
    }


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

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.render(scene, camera);
}

function click(event) {
    ++visible;
    visible %= spheres.length;

    console.log('Mesh ', visible + 1, ' out of ', spheres.length, ' : ', spheres[visible].children[0].geometry.attributes.position.array.length, ' vertices (with duplication...)');

    // hide everything except visible
    for (var i in spheres)
    {
        hide(spheres[i]);
    }
    show(spheres[visible]);
}

function hide(object) {
    object.traverse(function ( object ) { object.visible = false; } );
}

function show(object) {
    object.traverse(function ( object ) { object.visible = true; } );
}
