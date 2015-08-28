var renderer, scene, camera, controls, cube, container, plane, mouse= {x:0, y:0};
var raycaster;
var objects = [];
var containerSize = {};
var previousTime;
containerSize.width = 1067;
containerSize.height = 600;

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
    document.getElementById('container').appendChild(renderer.domElement);

    // on initialise la scène
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();

    // init light
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.5, 1).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);

    // on initialise la camera que l’on place ensuite sur la scène
    camera = new L3D.Camera(50, containerSize.width / containerSize.height, 1, 10000);
    scene.add(camera);

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mousedown', click, false);

    // on créé un  cube au quel on définie un matériau puis on l’ajoute à la scène
    cube = new BouncingCube(200, {color: "red"});
    plane = new L3D.Plane(1000,1000);
    plane.translate(0,0,-100);

    cube.addToScene(scene);
    plane.addToScene(scene);

    objects.push(cube);
    objects.push(plane);
}

function animate() {
    // on appelle la fonction animate() récursivement à chaque frame
    requestAnimationFrame(animate);

    cube.update();

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
    mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
    mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;

    // For this alternate method, set the canvas position *fixed*; set top > 0, set left > 0; padding must be 0; margin > 0 is OK
    //mouse.x = ( ( event.clientX - container.offsetLeft ) / container.clientWidth ) * 2 - 1;
    //mouse.y = - ( ( event.clientY - container.offsetTop ) / container.clientHeight ) * 2 + 1;

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);

    raycaster.set(camera.position, vector.sub(camera.position).normalize());

    intersects = raycaster.intersectObjects(scene.children);

    if ( intersects.length > 0 ) {
        for (var i in intersects) {
            if (intersects[i].object.id === cube.mesh.id) {
                cube.speed.z = 300;
            }
        }
    }
}
