// Let's be sure we avoid using global variables
var onWindowResize = (function() {

// Disable scrolling
window.onscroll = function () { window.scrollTo(0, 0); };

window.onload = main;

var stats;
var renderer, scene, container;
var clickableObjects = [];
var recommendations, objectClicker;
var previewer;
var camera1;
var coins = [];
var previousTime;
var pointer;
var startCanvas;
var tutorial;

function main() {

    // Main container that holds everything
    container = document.getElementById('container');

    // Initialization
    initThreeElements();
    initCanvases();
    initModels();
    initListeners();

    appendTo(container)(stats, Coin, startCanvas, pointer, previewer, renderer);

    // Set the good size of cameras
    onWindowResize();

    Coin.update();

    // Start tutorial
    tutorial.setCameras(recommendations);
    tutorial.nextStep();

    startCanvas.render();

    // Bind previewer to renderer (for fixed option)
    function bind() {
        if (document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement) {
            // Lock event
            previewer.fixed = true;
        } else {
            // Unlock event
            previewer.fixed = false;
        }
    }
    document.addEventListener('pointerlockchange', bind);
    document.addEventListener('mozpointerlockchange', bind);
    document.addEventListener('webkitpointerlockchange', bind);

    // Start rendering
    setInterval(render, 20);

    // Log fps
    setInterval(function() {logfps(stats.getFps());}, 500);

}

function initThreeElements() {

    // Initialize scene
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setClearColor(0x87ceeb);

    // Initialize pointer camera
    camera1 = new TutoCamera(
        50,
        container_size.width() / container_size.height(),
        0.01, 100000, renderer, scene, onWindowResize, container_size, coins, container, clickableObjects
    );

    tutorial = camera1.tutorial;

}

function initCanvases() {

    // Initialize previewer
    previewer = new L3D.Previewer(renderer, scene);
    previewer.domElement.style.position ="absolute";
    previewer.domElement.style.cssFloat = 'top-left';

    // Initialize stats counter
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.cssFloat = "top-left";

    // Initialize pointer for pointer lock
    pointer = new L3D.MousePointer(camera1);

    // Init start canvas
    startCanvas = new L3D.StartCanvas(camera1);

}

function initModels() {

    // Init recommendations
    recommendations = L3D.initPeach(camera1, scene, coins, clickableObjects, null);

    // init clickable objects
    // var i;
    // for (i = 0; i < coins.length; i++)
    //     clickableObjects.push(coins[i]);

    // for (i =0; i < recommendations.length; i++)
    //     clickableObjects.push(recommendations[i]);

}

function initListeners() {

    // Add listeners
    window.addEventListener('resize', onWindowResize, false);

    // HTML Bootstrap buttons
    buttonManager = new ButtonManager(camera1, recommendations, previewer);

    // Object clicker for hover and clicking recommendations
    objectClicker = new L3D.ObjectClicker(
        renderer,
        camera1,
        clickableObjects,
        objectClickerOnHover(camera1, previewer, recommendations, container), // Create onHover function
        objectClickerOnClick(camera1, buttonManager, recommendations, coins), // Create onClick function
        container
    );

}

function render() {

    // Stats for render
    stats.begin();

    objectClicker.update();

    // Update recommendations (set raycastable if shown)
    recommendations.map(function(reco) {
        if (reco instanceof Recommendation) {
            reco.traverse(function(elt) {
                elt.visible = elt.raycastable = buttonManager.showArrows;
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
    recommendations.map(function(reco) { reco.update(camera1);});

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
    recommendations.map(function(reco) { if (reco instanceof Recommendation) hide(reco); });

    // Update transparent elements
    THREEx.Transparency.update(camera1);

    // Render preview
    previewer.render(container_size.width(), container_size.height());

    // Finish stats
    stats.end();

}

function onWindowResize() {

    resizeElements(renderer, container, previewer, Coin, pointer, startCanvas);

    recommendations.forEach(function(reco) {
        resetCameraAspect(reco.camera, container_size.width(), container_size.height());
    });

    render();

}

// onWindowResize will be the only global function
return onWindowResize;

})();
