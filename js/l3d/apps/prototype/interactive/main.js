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
    width: function() { return 1134; },
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
var clickableObjects = [];
var recommendations, objectClicker;
var spheres = new Array(mesh_number);
var visible = 0;
// stats;
var previewer;
var camera1;
var loader;
var coins = [];
var previousTime;
var hoveredCamera = null;

window.onbeforeunload = function() {

    if (initMainScene !== L3D.initPeach && initMainScene !== L3D.initSponza && Coin.total !== 9) {

        return 'Warning : you are going to leave the page and abort the current test !';

    }

};


init();
if (initMainScene !== L3D.initPeach && initMainScene !== L3D.initSponza)
    logfps();
else
    L3D.BD.disable();

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

    recommendations = initMainScene(camera1, scene, coins, clickableObjects);
    // recommendations = L3D.initPeach(camera1, scene, coins, clickableObjects);
    // recommendations = L3D.initBobomb(camera1, scene, coins, clickableObjects);
    // recommendations = L3D.initWhomp(camera1, scene, , coins, clickableObjects);
    // recommendations = L3D.initMountain(camera1, scene, coins, clickableObjects);
    // recommendations = L3D.initSponza(camera1, scene, coins, clickableObjects);

    // init clickable objects
    var i;
    for (i = 0; i < coins.length; i++)
        clickableObjects.push(coins[i]);

    for (i =0; i < recommendations.length; i++)
        clickableObjects.push(recommendations[i]);

    // Add listeners
    initListeners();

    // Set interval on animate
    setInterval(animate, 20);
}

function initListeners() {
    window.addEventListener('resize', onWindowResize, false);

    // Escape key to exit fullscreen mode
    document.addEventListener('keydown', function(event) { if (event.keyCode == 27) { stopFullscreen();} }, false);

    // HTML Bootstrap buttons
    buttonManager = new ButtonManager(camera1, recommendations, previewer);

    // Object clicker for hover and clicking recommendations
    objectClicker = new L3D.ObjectClicker(renderer, camera1, clickableObjects,
        function onHover(obj,x,y) {

            // Check if the object is clickable
            var ok = obj instanceof Coin || obj instanceof L3D.BaseRecommendation;

            // Little graphic stuff so the user knows that it's clickable
            container.style.cursor = ok ? "pointer" : "auto";
            if (camera1.pointerLocked)
                camera1.mousePointer.render(ok ? L3D.MousePointer.RED : L3D.MousePointer.BLACK);

            // Set previewer for preview
            previewer.setCamera(obj instanceof L3D.BaseRecommendation ? obj.camera : null)
            previewer.setPosition(x,y);

            // Manage the hover camera event
            if (hoveredCamera !== obj) {

                var event = new L3D.BD.Event.Hovered();

                if (obj instanceof L3D.BaseRecommendation) {
                    // The newly hovered object is different and is a recommendation

                    event.arrow_id = recommendations.indexOf(obj);
                    event.start = true;
                    event.send();

                    hoveredCamera = obj

                } else if (hoveredCamera instanceof L3D.BaseRecommendation) {
                    // The newly hovered object is not a recommendation,
                    // but the previous one is : we must log

                    // Unhovered
                    event.arrow_id = 0;
                    event.start = false;
                    event.send();

                    hoveredCamera = null;

                }

            }

        },

        function onClick(obj) {

            var event;

            // Do stuff for click
            if (obj instanceof Coin) {

                obj.get();

                // Send event to DB
                event = new L3D.BD.Event.CoinClicked();
                event.coin_id = coins.indexOf(obj);
                event.send();

            } else if (obj instanceof L3D.BaseRecommendation) {
                camera1.moveHermite(obj);

                // Send event to DB
                event = new L3D.BD.Event.ArrowClicked();
                event.arrow_id = recommendations.indexOf(obj);
                event.send();
            }

            // Update the button manager
            buttonManager.updateElements();

        },
        container
    );
}

function render() {
    objectClicker.update();

    // Update recommendations (set raycastable if shown)
    var transform = buttonManager.showArrows ? show : hide;
    recommendations.map(function(reco) {
        if (reco instanceof Recommendation) {
            transform(reco);

            reco.traverse(function(elt) {
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
    recommendations.forEach(function(reco) {reco.camera.aspect = container_size.width() / container_size.height();});
    recommendations.forEach(function(reco) {reco.camera.updateProjectionMatrix();});
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


