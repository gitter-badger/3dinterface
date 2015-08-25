var onWindowResize = (function() {

// Disable scrolling
window.onscroll = function () { window.scrollTo(0, 0); };

window.onload = main;

var renderer, scene, container;
var recommendations;
var stats;
var camera1;
var coins = [];
var previousTime;


function main() {

    container = document.getElementById('container');

    initThreeElements();

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/prototype/replay_info/" + params.get.id, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            init(JSON.parse(xhr.responseText));
            onWindowResize();
            setInterval(render, 20);
        }
    };
    xhr.send();

}

function initThreeElements() {

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({alpha:true, antialias: true});
    renderer.setClearColor(0x87ceeb);

}

function init(data) {

    console.log(data);

    // Some config
    L3D.DB.disable();

    // Initialize stats counter
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.cssFloat = "top-left";

    // Add elements to page
    container.appendChild(Coin.domElement);
    container.appendChild( stats.domElement );
    container.appendChild(renderer.domElement);

    // Initialize replay camera
    camera1 = new L3D.ReplayCamera(50, container_size.width()/container_size.height(), 0.01, 100000, coins, data);
    recommendations = initMainScene(camera1, scene, coins, undefined, data.redCoins);
    camera1.cameras = recommendations;

    camera1.start();

    // Add listeners
    initListeners();


}

function initListeners() {
    window.addEventListener('resize', onWindowResize, false);
}

function render() {

    stats.begin();

    // Update coins
    coins.forEach(function(coin) { coin.update(); });

    // Update main camera
    var currentTime = Date.now() - previousTime;
    camera1.update(isNaN(currentTime) ? 20 : currentTime);
    previousTime = Date.now();

    // Update the recommendations
    recommendations.map(function(camera) {camera.update(camera1);});

    // Set current position of camera
    camera1.look();

    renderer.render(scene, camera1);

    stats.end();

}

function onWindowResize() {

    resizeElements(renderer, container, Coin);

    recommendations.forEach(function(reco) {resetCameraAspect(reco.camera);});

    render();
}


return onWindowResize;

})();
