var isFullscreen = false;
var beenFullscreen = false;

var main_section = document.getElementById('main-section');

// var container_size = {
//     width: function() { if (!isFullscreen) return main_section.clientWidth; else return screen.width;},
//     height: function() {
//         if (!isFullscreen)
//             return main_section.clientHeight
//                 - document.getElementById('nav').offsetHeight
//                 - document.getElementById('main-div').offsetHeight;
//         else
//             return screen.height;
//     }
// };
var container_size = {
    width: function() { return 1024; },
    height: function() { return 768; }
};

var stats;

// Let's be sure we avoid using global variables
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
// stats;
var previewer;
var camera1;
var loader;
var coins = [];
var previousTime;

window.onbeforeunload = function() {

    if (initMainScene !== L3D.initPeach && initMainScene !== L3D.initSponza && Coin.total !== 9) {

        return 'Warning : you are going to leave the page and abort the current test !';

    }

};


init();
if (initMainScene !== L3D.initPeach && initMainScene !== L3D.initSponza)
    logfps();
animate();

function logfps() {

    // Log fps
    if (stats !== undefined) {

        var event = new L3D.BD.Event.Fps();
        event.fps = stats.getFps();
        event.send();

    }

    setTimeout(logfps, 1000);

}

function init() {
    // Initialize scene
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});

    // Collidable objects to prevent camera from traversing objects
    var collidableObjects = [];

    // Initialize renderer
    container = document.getElementById('container');
    container.style.height = container_size.height() + 'px';
    container.style.width = container_size.width() + 'px';
    renderer.setSize(container_size.width(), container_size.height());
    // renderer.setSize(container_size.width(), container_size.height());
    renderer.setClearColor(0x87ceeb);

    // Initialize pointer camera
    camera1 = new L3D.PointerCamera(50, container_size.width() / container_size.height(), 0.01, 100000, renderer, container);

    // Initialize previewer
    previewer = new L3D.Previewer(renderer, scene);
    previewer.domElement.style.position ="absolute";
    previewer.domElement.style.cssFloat = 'top-left';
    previewer.domElement.width = container_size.width();
    previewer.domElement.height = container_size.height();

    // Initialize stats counter
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.cssFloat = "top-left";

    // Initialize pointer for pointer lock
    var pointer = new L3D.MousePointer(camera1);
    pointer.domElement.width = container_size.width();
    pointer.domElement.height = container_size.height();

    //
    var startCanvas = new L3D.StartCanvas(camera1);
    startCanvas.domElement.width = container_size.width();
    startCanvas.domElement.height = container_size.height();

    // Add elements to page
    container.appendChild( stats.domElement );
    container.appendChild(Coin.domElement);
    container.appendChild(startCanvas.domElement);
    container.appendChild(pointer.domElement);
    container.appendChild(previewer.domElement);
    container.appendChild(renderer.domElement);

    startCanvas.render();

    cameras = initMainScene(camera1, scene, coins);
    // cameras = L3D.initPeach(camera1, scene, coins);
    // cameras = L3D.initBobomb(camera1, scene, coins);
    // cameras = L3D.initWhomp(camera1, scene, , coins);
    // cameras = L3D.initMountain(camera1, scene, coins);
    // cameras = L3D.initSponza(camera1, scene, coins);

    // Add listeners
    initListeners();

    // Set interval on animate
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
    });

    // Escape key to exit fullscreen mode
    document.addEventListener('keydown', function(event) { if (event.keyCode == 27) { stopFullscreen();} }, false);

    // HTML Bootstrap buttons
    buttonManager = new ButtonManager(camera1, cameras, previewer);

    // Camera selecter for hover and clicking recommendations
    cameraSelecter = new L3D.CameraSelecter(renderer, scene, camera1, cameras, coins, buttonManager);
}

function render() {
    cameraSelecter.update();

    // Update recommendations (set raycastable if shown)
    var transform = buttonManager.showArrows ? show : hide;
    cameras.map(function(camera) {
        if (camera instanceof Recommendation) {
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
    camera1.update(isNaN(currentTime) ? 20 : currentTime);
    previousTime = Date.now();

    // Update the recommendations
    cameras.map(function(cam) { cam.update(camera1);});

    // Set current position of camera
    camera1.look();

    var left = 0, bottom = 0, width = container_size.width(), height = container_size.height();
    renderer.setScissor(left, bottom, width, height);
    renderer.enableScissorTest(true);
    renderer.setViewport(left, bottom, width, height);
    renderer.render(scene, camera1);

    // Remove borders of preview
    previewer.clear();

    // Hide arrows in recommendation
    cameras.map(function(camera) { if (camera instanceof Recommendation) hide(camera); });

    // Update transparent elements
    THREEx.Transparency.update(camera1);

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

// onWindowResize will be the only global function
return onWindowResize;

})();

function fullscreen() {
    var container = document.getElementById('container');
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

    var container = document.getElementById('container');

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


