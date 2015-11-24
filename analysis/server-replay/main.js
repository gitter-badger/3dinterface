"use strict";

require('app-module-path').addPath(__dirname + '/../../server/lib/');

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

let fs = require('fs');
let THREE = require('./three.js');
let L3D = require('../../static/js/l3d.min.js');
let Serial = require('Serial');
let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// Start
let width =  Math.floor(1134);
let height = Math.floor(768);
let imageNumber = 0;
let info = {};
let progLoader;
let modelMap;
let smallMap;
let smallModel;
let triangleMeshes = [];

let renderer = new THREE.CanvasRenderer();
renderer.domElement.style = renderer.domElement;
renderer.setSize(width,height);
renderer.setClearColor(0x000000);

let id = process.argv[2] === undefined ? 56 : parseInt(process.argv[2]);

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
camera.position.z = 1000;

let geometry = new THREE.BoxGeometry(200, 200, 200);
let material = new THREE.MeshBasicMaterial({color: 0xff0000});

let mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
scene.add(camera);

let counter = 0;

init()

function init() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:4000/prototype/replay-info/" + id, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {

            let data = JSON.parse(xhr.responseText);

            console.log('sceneId = ' + data.sceneInfo.sceneId + ';');
            console.log('recoStyle = ' + data.sceneInfo.recommendationStyle + ';');
            console.log('expId = ' + id + ';');
            console.log();
            console.log('M = [');

            camera = new L3D.ReplayCamera(50, width / height, 0.01, 100000, [], data, () => finished = true);
            let path = initElements(camera, data.sceneInfo, data.redCoins);

            if (process.argv[3] === 'null') {
                info.camera = null;
                info.sort = false;
            } else if (process.argv[3] === 'cull') {
                info.camera = camera;
                info.sort = false;
            } else if (process.argv[3] === 'reco') {
                info.camera = camera;
                info.sort = true;
            }

            progLoader = new L3D.ProgressiveLoader(
                buildPathBigObj(path), scene, info.camera, null, function(a,b) { /* process.stderr.write((100*a/b) + '%\n'); */ }, false, info.sort
            );

            // Init variables
            modelMap = JSON.parse(fs.readFileSync(buildPathMap(path), 'utf-8'));
            let bigModel = Serial.loadFromFile(buildPathBigObjStatic(path));
            smallModel = Serial.loadFromFile(buildPathSmallObjStatic(path));


            // Build triangleMeshes
            let material = new THREE.MeshFaceMaterial();

            // For each small triangle
            let counter = 0;
            for (let key in modelMap) {

                let geometry = new THREE.Geometry();
                geometry.vertices = bigModel.children[0].geometry.vertices;

                for (let i = 0; i < modelMap[key].length; i++) {
                    let face = modelMap[key][i];
                    let split = face.split('-').map(function(o) { return parseInt(o,10) - 1; });
                    let face3 = new THREE.Face3(split[0], split[1], split[2]);

                    face3.materialIndex = counter;
                    material.materials.push(new THREE.MeshBasicMaterial({color: counter, overdraw: true}));

                    geometry.faces.push(face3);

                    counter++;
                }

                let name = key.split('-').map(function(o) { return parseInt(o,10)-1; }).join('-');
                triangleMeshes[name] = new THREE.Mesh(geometry, material);
                scene.add(triangleMeshes[name]);

            }

            process.stderr.write('Loading complete.\n');

            progLoader.onBeforeEmit = loop;

            progLoader.load(function() {
                process.stderr.write("Loading complete\n");
                forceFinished = true;
            });

            scene.add(camera);

            camera.reset();
            camera.speed = 0.001;
            camera.start();

        }
    };
    xhr.send();
}

function buildPathSmallObj(path) { return '/static/data/' + path.folder + '/' + path.name + '.obj'; }
function buildPathBigObj(path) { return '/static/data/' + path.folder + '/' + path.name + '_sub' + '.obj'; }
function buildPathSmallObjStatic(path) { return './models/' + path.name + '.json'; }
function buildPathBigObjStatic(path)   { return './models/' + path.name + '_sub' + '.json'; }
function buildPathMap(path) { return './maps/' + path.name + '.json'; }

function loop() {

    process.stderr.write(imageNumber + '\n');

    camera.update(20);

    camera.look();

    process.stderr.write('Rendering...\n');
    let lastTime = Date.now();
    renderer.render(scene, camera);
    process.stderr.write('Renderered in ' + (Date.now() - lastTime) + '\n');

    fs.writeFileSync(__dirname + '/img/' + pad(imageNumber++, 5) + '.png', renderer.domElement.toBuffer());

}


function initElements(camera, sceneInfo, redCoins) {
    switch (sceneInfo.sceneId) {
        case 1:
            camera.resetElements = L3D.resetPeachElements();
            camera.cameras = L3D.createPeachRecommendations(width, height);
            camera.speed = 0.001;
            camera.coins = L3D.generateCoins(L3D.createPeachCoins(), redCoins);
            return '/static/data/castle/princess peaches castle (outside)_sub.obj';
        case 2:
            camera.resetElements = L3D.resetBobombElements();
            camera.cameras = L3D.createBobombRecommendations(width, height);
            camera.speed = 0.005;
            // camera.coins = L3D.generateCoins(L3D.createBobombCoins(), redCoins);
            return {name: 'bobomb battlefeild', folder:'bobomb'};
        case 3:
            camera.resetElements = L3D.resetMountainElements();
            camera.cameras = L3D.createMountainRecommendations(width, height);
            camera.speed = 0.005;
            // camera.coins = L3D.generateCoins(L3D.createMountainCoins(), redCoins);
            return {name :'coocoolmountain', folder:'mountain'};
        case 4:
            camera.resetElements = L3D.resetWhompElements();
            camera.cameras = L3D.createWhompRecommendations(width, height);
            camera.speed = 0.002;
            // camera.coins = L3D.generateCoins(L3D.createWhompCoins(), redCoins);
            return {name:'Whomps Fortress', folder:'whomp'};
        default:
            process.stderr.write('This sceneId doesn\'t exist\n');
            process.exit(-1);


    }
}


