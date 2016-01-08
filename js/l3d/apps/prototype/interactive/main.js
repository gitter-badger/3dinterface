L3D.DB.disable();

// Let's be sure we avoid using global variables
var onWindowResize = (function() {

L3D.ProgressiveLoader.onFinished = function() {

    if (coins.length === 0 || coins[0].mesh === undefined) {
        setTimeout(L3D.ProgressiveLoader.onFinished, 500);
        return;
    }

    for (var i = 0; i < coins.length; i++) {
        coins[i].mesh.visible = true;
    }

    if (GLOB.initMainScene !== L3D.initSponza)
        loadingCanvas.clear();

    L3D.DB.enable();
    camera1.reset();
};

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
var loadingCanvas;
var coinCanvas;

// window.onbeforeunload = function() {
//
//     if (initMainScene !== L3D.initPeach && initMainScene !== L3D.initSponza && !($('#next').is(":visible"))) {
//
//         return 'Warning : you are going to leave the page and abort the current test !';
//
//     }
//
// };

var nextPage = '/prototype/play';

Coin.onCoinGot = function(coin) {
    coinCanvas.setLevel(Coin.total / Coin.max);

    if (coin === 6) {
        setTimeout(function() { setNextButton(nextPage, coinCanvas); }, 60*1000);
    } else if (coin === 8) {
        setNextButton(nextPage, coinCanvas);
    }
};

function main() {

    // Main container that holds everything
    container = document.getElementById('container');

    // Initialization
    initThreeElements();
    initCanvases();
    initModels();
    initListeners();

    if (GLOB.hideBeforeLoading === true) {
        appendTo(container)(stats, coinCanvas, startCanvas, pointer, previewer, loadingCanvas, renderer);
        loadingCanvas.render();
    } else
        appendTo(container)(startCanvas, pointer, previewer, renderer);

    // Set the good size of cameras
    onWindowResize();

    coinCanvas.update(true);


    if (GLOB.locked !== undefined && GLOB.locked)
        startCanvas.render();

    // Some config
    if (GLOB.initMainScene !== L3D.initPeach && GLOB.initMainScene !== L3D.initSponza)
        setInterval(function() {logfps(stats.getFps());}, 500);
    else
        L3D.DB.disable();

    // startCanvas.render(L3D.StartCanvas.Black);

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
    scene = new GLOB.SceneClass();
    scene.addEventListener('onload', function() { loadingCanvas.clear(); });
    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setClearColor(0x87ceeb);

    // var loader = new THREE.OBJLoader();

    // loader.load(
    //     '/static/data/coin/Coin.obj',
    //     function(object) {
    //         object.traverse(function (mesh) {
    //             if (mesh instanceof THREE.Mesh) {
    //                 mesh.scale.set(0.01,0.01,0.01);
    //                 mesh.material.color.setHex(0xffff00);
    //                 mesh.geometry.computeVertexNormals();
    //                 mesh.raycastable = true;
    //                 mesh.position.copy(new THREE.Vector3(-23.85237224023958,12.30017484578007,2.883526209796364));
    //                 scene.add(mesh);

    //                 newMesh = mesh.clone();
    //                 newMesh.position.copy(new THREE.Vector3(-8.225753727064939,11.932703941399415,8.637544772060489));
    //                 scene.add(newMesh);

    //                 newMesh.position.copy(new THREE.Vector3(18.198980821370327,2.5219742652442885,10.741621475827422));
    //                 scene.add(newMesh);

    //             }
    //         });
    //     }
    // );

    // Initialize pointer camera
    camera1 = new L3D.PointerCamera(
        50,
        containerSize.width() / containerSize.height(),
        0.01, 100000, renderer, container
    );

    scene.setCamera(camera1);

    scene.load(GLOB.prefetch, GLOB.lowRes);

    scene.addRecommendations(GLOB.Recommendation);

    scene.addCoins(GLOB.coinConfig);

    camera1.collidableObjects = scene.collidableObjects;

    // Get default param for camera lock
    document.getElementById('lock').checked = GLOB.locked;
    camera1.shouldLock = GLOB.locked;
    camera1.onPointerLockChange();

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

    // Initialize coin counter
    coinCanvas = new CoinCanvas();
    coinCanvas.domElement.style.position = 'absolute';
    coinCanvas.domElement.style.cssFloat = 'top-left';

    // Initialize pointer for pointer lock
    pointer = new L3D.MousePointer(camera1);

    // Init start canvas
    startCanvas = new L3D.StartCanvas(camera1);

    loadingCanvas = new L3D.LoadingCanvas();
}

function initModels() {

    // // Init recommendations
    // recommendations = GLOB.initMainScene(camera1, scene, coins, clickableObjects);

    // // init clickable objects
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
        scene.clickableObjects,
        objectClickerOnHover(camera1, previewer, scene.recommendations, container), // Create onHover function
        objectClickerOnClick(camera1, buttonManager, scene.recommendations, scene.coins), // Create onClick function
        container
    );

}

function render() {

    // Stats for render
    stats.begin();

    objectClicker.update();

    // Update recommendations (set raycastable if shown)
    scene.recommendations.map(function(reco) {
        if (reco instanceof L3D.BaseRecommendation) {
            reco.traverse(function(elt) {
                elt.visible = elt.raycastable = buttonManager.showArrows;
            });
        }
    });

    // Update coins
    scene.coins.forEach(function(coin) { coin.update(); });

    // Update main camera
    var currentTime = Date.now() - previousTime;
    camera1.update(isNaN(currentTime) ? 20 : currentTime);
    previousTime = Date.now();

    coinCanvas.update();
    coinCanvas.render();

    // Update the recommendations
    scene.recommendations.map(function(reco) { reco.update(camera1);});

    // Set current position of camera
    camera1.look();

    var left = 0, bottom = 0, width = containerSize.width(), height = containerSize.height();
    renderer.setScissor(left, bottom, width, height);
    renderer.enableScissorTest(true);
    renderer.setViewport(left, bottom, width, height);
    renderer.render(scene, camera1);

    // Remove borders of preview
    previewer.clear();

    // Hide arrows in recommendation
    scene.recommendations.map(function(reco) { if (reco instanceof L3D.BaseRecommendation) hide(reco); });

    // Update transparent elements
    THREEx.Transparency.update(camera1);

    // Render preview
    previewer.render(containerSize.width(), containerSize.height());


    // Finish stats
    stats.end();

}

function onWindowResize() {

    resizeElements(renderer, container, previewer, coinCanvas, pointer, startCanvas, loadingCanvas);

    scene.recommendations.forEach(function(reco) {
        resetCameraAspect(reco.camera, containerSize.width(), containerSize.height());
    });

    render();

}

// onWindowResize will be the only global function
return onWindowResize;

})();
