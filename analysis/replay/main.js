"use strict";

// REQUIRES AND INITS
let width =  Math.floor(1134/10);
let height = Math.floor(768 /10);

let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
let THREE = require('three');
let L3D = require('../../static/js/l3d.min.js');
let math = require('mathjs');
let fs = require('fs');

let scene = new THREE.Scene();
let geometry = new THREE.Geometry();

let peach = new THREE.Object3D();
let bobomb = new THREE.Object3D();
let whomp = new THREE.Object3D();
let mountain = new THREE.Object3D();

var finished = false;
let frame = 0;
let raycaster = new THREE.Raycaster();

var total = 0;

let loader, progLoader;

let id = 56;


// INIT COLORS
var colors = [[0,0,0]];

for (let i = 0; i < 856; i++) {
    colors.push([
        Math.floor(255*Math.random()),
        Math.floor(255*Math.random()),
        Math.floor(255*Math.random())
    ]);
}

var camera; var finished = false;
var Recommendation = L3D.BaseRecommendation;
var forceFinished = false;
main();

// FUNCTIONS
function main() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:4000/prototype/replay-info/" + id, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {

            var data = JSON.parse(xhr.responseText);

            console.log('%sceneId = ' + data.sceneInfo.sceneId);
            console.log('%recoStyle = ' + data.sceneInfo.recommendationStyle);
            console.log('%expId = ' + id);
            console.log();
            console.log('M = [');

            camera = new L3D.ReplayCamera(50, width / height, 0.01, 100000, [], data, () => finished = true);
            var path = initElements(camera, data.sceneInfo);

            loader = new L3D.ProgressiveLoader(
                path, new THREE.Object3D(), null
            );

            progLoader = new L3D.ProgressiveLoader(
                path, scene, camera, null, null, true
            );

            loader.load(function(){
                process.stderr.write('Loading complete.\n');
                progLoader.load(function() {
                    process.stderr.write("Loading complete\n");
                    forceFinished = true;
                });
                init(data);
            });
        }
    };
    xhr.send();
}

function testDistance(old, newP) {

    return (
        L3D.Tools.norm2(L3D.Tools.diff(old.position, newP.position)) +
        L3D.Tools.norm2(L3D.Tools.diff(old.target, newP.target)) > 0.1
    );
}


function initElements(camera, sceneInfo) {
    switch (sceneInfo.sceneId) {
        case 1:
            camera.resetElements = L3D.resetPeachElements();
            camera.cameras = L3D.createPeachRecommendations(width, height);
            camera.speed = 0.001;
            return '/static/data/castle/princess peaches castle (outside).obj';
        case 2:
            camera.resetElements = L3D.resetBobombElements();
            camera.cameras = L3D.createBobombRecommendations(width, height);
            camera.speed = 0.005;
            return '/static/data/bobomb/bobomb battlefeild.obj';
        case 3:
            camera.resetElements = L3D.resetMountainElements();
            camera.cameras = L3D.createMountainRecommendations(width, height);
            camera.speed = 0.005;
            return '/static/data/mountain/coocoolmountain.obj';
        case 4:
            camera.resetElements = L3D.resetWhompElements();
            camera.cameras = L3D.createWhompRecommendations(width, height);
            camera.speed = 0.002;
            return '/static/data/whomp/Whomps Fortress.obj';
        default:
            console.err('This sceneId doesn\'t exist');
            process.exit(-1);


    }
}

function init(data) {
    scene.add(camera);

    camera.reset();
    camera.speed = 0.001;
    camera.start();
    setTimeout(loop, 0);
}

function equalFaces(face1, face2) { return face1.a === face2.a && face1.b === face2.b && face1.c === face2.c; };

function printVector(vec) { console.log(`(${vec.x},${vec.y},${vec.z})`); }

let old;

function loop() {

    old = {
        position: new THREE.Vector3().copy(camera.position),
        target: new THREE.Vector3().copy(camera.target)
    };

    for (let i = 0; i < 10; i++)
        finished = camera.update(20);

    total++;

    if (!testDistance(old, camera) && !finished && !forceFinished) {
        process.nextTick(loop);
        finish();
        return;
    }


    camera.look();
    camera.updateMatrixWorld(true);

    // printVector(camera.position);

    let buf = [];
    // let buf2 = [];

    let score = 0;

    for (let i = 0; i < width; i++) {

        buf[i] = [];

        let x = (i / width) * 2 - 1;

        // process.stderr.write('\b\r' + Math.floor(100*(i / width)) + '%\n');

        for (let j = 0; j < height; j++) {

            let y = (j / height) * 2 - 1;

            raycaster.setFromCamera({x:x, y:y}, camera);

            let intersectsProg = raycaster.intersectObject(progLoader.obj, true);
            let intersects = raycaster.intersectObject(loader.obj, true);

            if (intersectsProg.length === 0 && intersects.length === 0) {
                score++;
            } else if (intersectsProg.length !== intersects.length) {
                // Not good
            } else if (equalFaces(intersectsProg[0].face, intersects[0].face)) {
                score++;
            }

            if (intersectsProg.length > 0) {
                buf[i][j] = intersectsProg[0].faceIndex;
            }


        }

    }

    score /= width * height;

    // for (let i = 0; i < 255; i++) {
    //     colorsOccurence[i+1] += colorsOccurence[i];
    // }

    var buffer = [];
    buffer.push('P3\n');
    buffer.push(width+'\n');
    buffer.push(height+'\n');
    buffer.push(255+'\n');

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            var grey = buf[j][height - i - 1];
            if (colors[grey] === undefined)
                buffer.push('0 0 0\n');
            else {
                buffer.push(colors[grey][0] + ' ' + colors[grey][1] + ' ' + colors[grey][2] + '\n');
            }
        }
    }

    let frameName = "" + frame;
    var pad = "00000";
    frameName = pad.substring(0, pad.length - frameName.length) + frameName;
    fs.writeFileSync(`img/${frameName}.ppm`, buffer.join(''));


    // Write image buffer to disk
    console.log(score);
    process.stderr.write('Frame : ' + frame++ + ', score = ' + score + '\n');

    if (!finished && !forceFinished)
        setTimeout(loop,50);
    else
        finish();
}

function finish() { console.log('];') }

