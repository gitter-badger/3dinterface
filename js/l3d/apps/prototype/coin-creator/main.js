// Let's be sure we avoid using global variables
var onWindowResize = (function() {

// Disable scrolling
window.onscroll = function () { window.scrollTo(0, 0); };
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
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

saveCoins = function() {

    var result = '[';

    for (var i = 0; i < coins.length - 1; i++) {
        result += JSON.stringify(coins[i].mesh.position) + ',';
    }
    result += JSON.stringify(coins[coins.length-1].mesh.position) + ']';

    var blob = new Blob([result], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "coins.js");

};

function main() {

    // Main container that holds everything
    container = document.getElementById('container');

    // Initialization
    initThreeElements();
    initCanvases();
    initModels();
    initListeners();

    appendTo(container)(stats, startCanvas, pointer, previewer, renderer);

    // Set the good size of cameras
    onWindowResize();

    // Some config
    if (initMainScene !== L3D.initPeach && initMainScene !== L3D.initSponza)
        setInterval(function() {logfps(stats.getFps());}, 500);
    else
        L3D.BD.disable();

    Coin.update();
    startCanvas.render(L3D.StartCanvas.Black);

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

}

function initThreeElements() {

    // Initialize scene
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setClearColor(0x87ceeb);

    // Initialize pointer camera
    camera1 = new L3D.PointerCamera(
        50,
        container_size.width() / container_size.height(),
        0.01, 100000, renderer, container
    );

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
    recommendations = initMainScene(camera1, scene, coins, clickableObjects);

    // Erase coins and recommendations
    var i = 0;
    for (i =0; i < recommendations.length; i++)
        recommendations[i].traverse(function(obj) {obj.visible = false;});
    recommendations = [];

    // init clickable objects
    function hide(coins, i) {
        setTimeout(function() {coins[i].mesh.visible = false;}, 1000);
    }

    for (i = 0; i < coins.length; i++) {
        hide(coins, i);
    }
    // coins = [];


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

        // onclick
        function(c, x, y, event) {

            if (event.button !== 2)
                return;

            if (c !== undefined) {

                if (c.object instanceof Coin) {

                    c.object.mesh.visible = false;
                    c.object.raycastable = false;

                } else {

                    var newPosition = c.point.clone();
                    var direction = L3D.Tools.diff(newPosition, camera1.position);
                    direction.normalize();
                    direction.multiplyScalar(0.2);
                    newPosition.sub(direction);
                    var coin = new Coin(newPosition.x, newPosition.y, newPosition.z, function() {});
                    coin.addToScene(scene);
                    coins.push(coin);
                    clickableObjects.push(coin);

                }

            }
        },
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

    resizeElements(renderer, container, previewer, pointer, startCanvas);

    recommendations.forEach(function(reco) {
        resetCameraAspect(reco.camera, container_size.width(), container_size.height());
    });

    render();

}

// onWindowResize will be the only global function
return onWindowResize;

})();
