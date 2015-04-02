var renderer, scene, camera, controls, mesh, i = 0;
var raycaster;
var objects = [];
var container_size = new Object();
container_size.width = 1067;
container_size.height = 600;

init();
animate();

function init()
{
    // on initialise le moteur de rendu
    container = document.getElementById('container');
    container.style.height = container_size.height + 'px';
    container.style.width = container_size.width + 'px';
    renderer = new THREE.WebGLRenderer({alpha:"true"});
    renderer.setSize(container_size.width, container_size.height);
    renderer.shadowMapEnabled = true;
    document.getElementById('container').appendChild(renderer.domElement);
    container.addEventListener('mousedown', click, false);

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

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0,0,0), new THREE.Vector3(100,100,0), new THREE.Vector3(100,0,100));
    geometry.faces.push(new THREE.Face3(0,1,2));
    geometry.faces.push(new THREE.Face3(0,2,1));

    geometry.verticesNeedUpdate = true;
    geometry.groupsNeedUpdate = true;

    mesh = new THREE.Mesh(geometry);


    scene.add(mesh);
}

function animate()
{
    // on appelle la fonction animate() récursivement à chaque frame
    requestAnimationFrame(animate);

    i += 1;

    mesh.geometry.vertices.push(new THREE.Vector3(0+i,0+i,0+i), new THREE.Vector3(100+i,100+i,+i), new THREE.Vector3(100+i,0+i,100+i));
    var size = mesh.geometry.vertices.length-3;
    mesh.geometry.faces.push(new THREE.Face3(size, size+1, size+2), new THREE.Face3(size, size+2, size+1));
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.groupsNeedUpdate = true;

    camera.update();
    camera.look();

    renderer.render(scene, camera);

}

function onWindowResize()
{
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.render(scene, camera);
}

function click(event)
{

}
