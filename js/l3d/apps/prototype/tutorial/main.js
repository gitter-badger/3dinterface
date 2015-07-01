var beenFullscreen = false;
var isFullscreen = false;

var main_section = document.getElementById('main-section');

var container_size = {
        width: function() { return 1024; },
            height: function() { return 768; }
};

var onWindowResize = (function() {

// Disable scrolling
window.onscroll = function () { window.scrollTo(0, 0); };

var mesh_number = 25;
var renderer, scene, controls, cube, container, plane, mouse= {x:0, y:0};
var bigmesh;
var raycaster;
var objects = [];
var cameras, cameraSelecter;
var spheres = new Array(mesh_number);
var visible = 0;
var stats;
var previewer;
var loader;
var coins = [];
var previousTime;
var tutorial;

init();
animate();

function init() {
    // Initialize scene
    scene = new THREE.Scene();

    // Disable log for this time
    BD.disable();

    // Collidable objects to prevent camera from traversing objects
    var collidableObjects = [];

    // Initialize renderer
    container = document.getElementById('container');
    container.style.height = container_size.height() + 'px';
    container.style.width = container_size.width() + 'px';
    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setSize(container_size.width(), container_size.height());
    // renderer.setSize(container_size.width(), container_size.height());
    renderer.shadowMapEnabled = true;
    renderer.setClearColor(0x87ceeb);

    // Initialize previewer
    previewer = new Previewer(renderer, scene);
    previewer.domElement.style.position ="absolute";
    previewer.domElement.style.cssFloat = 'top-left';
    previewer.domElement.width = container_size.width();
    previewer.domElement.height = container_size.height();

    // Initialize stats counter
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.cssFloat = "top-left";

    var camera1 = new TutoCamera(50, container_size.width() / container_size.height(), 0.01, 100000, renderer, scene, onWindowResize, container_size, coins, container);

    // Initialize pointer for pointer lock
    var pointer = new MousePointer(camera1);
    pointer.domElement.width = container_size.width();
    pointer.domElement.height = container_size.height();

    //
    var startCanvas = new StartCanvas(camera1);
    startCanvas.domElement.width = container_size.width();
    startCanvas.domElement.height = container_size.height();
    startCanvas.render();

    // Add elements to page
    container.appendChild( stats.domElement );
    container.appendChild(Coin.domElement);
    container.appendChild(startCanvas.domElement);
    container.appendChild(pointer.domElement);
    container.appendChild(previewer.domElement);
    container.appendChild(renderer.domElement);

    // Initialize pointer camera
    tutorial = camera1.tutorial;

    cameras = new CameraContainer(camera1, []);
    tutorial.setCameras(cameras);

    // Load peach scene
    initPeach(camera1, scene);

    initListeners();

    tutorial.nextStep();

    setInterval(animate, 20);
}

function initListeners() {
    window.addEventListener('resize', onWindowResize, false);

    // Transmit click event to camera selecter
    container.addEventListener('mousedown', function(event) {
        if (event.which == 1)
            cameraSelecter.click(event);
        }, false
    );

    // Update camera selecter when mouse moved
    container.addEventListener('mousemove', function(event) {
            cameraSelecter.update(event);
        }, false
    );

    // Escape key to exit fullscreen mode
    document.addEventListener('keydown', function(event) { if (event.keyCode == 27) { stopFullscreen();} }, false);

    // HTML Bootstrap buttons
    buttonManager = new ButtonManager(cameras, previewer);

    // Camera selecter for hover and clicking recommendations
    cameraSelecter = new CameraSelecter(renderer, scene, cameras, coins, buttonManager);
}


function render() {
    cameraSelecter.update();

    // Update recommendations (set raycastable if shown)
    var transform = buttonManager.showArrows ? show : hide;
    cameras.map(function(camera) {
        if (camera instanceof RecommendedCamera) {
            transform(camera);

            camera.traverse(function(elt) {
                elt.raycastable = buttonManager.showArrows;
            });
        }
    });

    // Update coins
    coins.forEach(function(coin) { coin.update(); });

    // Update main camera
    var currentTime = Date.now() - previousTime;
    cameras.updateMainCamera(isNaN(currentTime) ? 20 : currentTime);
    previousTime = Date.now();

    // Update the recommendations
    cameras.update(cameras.mainCamera());

    // Set current position of camera
    cameras.look();

    var left = 0, bottom = 0, width = container_size.width(), height = container_size.height();
    renderer.setScissor(left, bottom, width, height);
    renderer.enableScissorTest(true);
    renderer.setViewport(left, bottom, width, height);
    THREEx.Transparency.update(cameras.mainCamera());
    renderer.render(scene, cameras.mainCamera());

    // Remove borders of preview
    previewer.clear();

    // Hide arrows in recommendation
    cameras.map(function(camera) { if (camera instanceof RecommendedCamera) hide(camera); });

    // Render preview
    previewer.render(cameraSelecter.prev, container_size.width(), container_size.height());
}

function animate() {
    // Render each frame
    // requestAnimationFrame(animate);

    // stats count the number of frames per second
    stats.begin();
    render();
    stats.end();
}

function onWindowResize() {

    container.style.width = container_size.width() + "px";
    container.style.height = container_size.height() + "px";

    previewer.domElement.width = container_size.width();
    previewer.domElement.height = container_size.height();

    renderer.setSize(container_size.width(), container_size.height());
    cameras.forEach(function(camera) {camera.aspect = container_size.width() / container_size.height();});
    cameras.forEach(function(camera) {camera.updateProjectionMatrix();});
    render();
}

function hide(object) {
    object.traverse(function(object) {object.visible = false;});
}

function show(object) {
    object.traverse(function(object) {object.visible = true;});
}

return onWindowResize;

})();

function fullscreen() {
    isFullscreen = true;

    if (!beenFullscreen) {
        beenFullscreen = true;
        alert('To quit fullscren mode, type ESC key');
    }

    container.style.position = "absolute";
    container.style.cssFloat = "top-left";
    container.style.top = "50px";
    container.style.bottom = "0px";
    container.style.left = "0px";
    container.style.right = "0px";
    container.style.width="";
    container.style.height="";
    container.style.overflow = "hidden";

    onWindowResize();
}

function stopFullscreen() {
    isFullscreen = false;

    container.style.position = "";
    container.style.cssFloat = "";
    container.style.top = "";
    container.style.bottom = "";
    container.style.left = "";
    container.style.right = "";
    container.style.width = container_size.width() + "px";
    container.style.height = container_size.height() + "px";

    onWindowResize();
}
