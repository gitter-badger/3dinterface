"use strict";

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

let loader = new L3D.ProgressiveLoader(
    '/static/data/castle/princess peaches castle (outside).obj',
    // '/static/data/bobomb/bobomb battlefeild.obj',
    scene,
    null
);

let id = 1;
main();

var colors = [[0,0,0]];

for (let i = 0; i < 856; i++) {
    colors.push([
        Math.floor(255*Math.random()),
        Math.floor(255*Math.random()),
        Math.floor(255*Math.random())
    ]);
}

function testDistance(old, newP) {

    return (
        L3D.Tools.norm2(L3D.Tools.diff(old.position, newP.position)) +
        L3D.Tools.norm2(L3D.Tools.diff(old.target, newP.target)) > 0.1
    );
}

function main() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:4000/prototype/replay-info/" + id, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            loader.load(function(){
                process.stderr.write('Loading complete.\n\n');
                init(JSON.parse(xhr.responseText))
            });
        }
    };
    xhr.send();
}

var camera;

var finished = false;

function init(data) {
    camera = new L3D.ReplayCamera(50, width / height, 0.01, 100000, [], data, () => finished = true);
    scene.add(camera);
    camera.resetElements = L3D.resetPeachElements();
    camera.reset();
    camera.speed = 0.001;
    camera.start();
    setTimeout(loop, 0);
}

function printVector(vec) { console.log(`(${vec.x},${vec.y},${vec.z})`); }

var finished = false;
let frame = 0;
let raycaster = new THREE.Raycaster();

var total = 0;
function loop() {

    let old;

    old = {
        position: new THREE.Vector3().copy(camera.position),
        target: new THREE.Vector3().copy(camera.target)
    };

    do {

        for (let i = 0; i < 10; i++)
            camera.update(20);

        total++;
        console.log(total);

    } while (!testDistance(old, camera) && !finished);

    camera.look();
    camera.updateMatrixWorld(true);

    // printVector(camera.position);

    let buf = [];
    let buf2 = [];

    let colorsOccurence = [];
    let max = 0;
    for (let i = 0; i < 256; i++) { colorsOccurence[i] = 0; }

    for (let i = 0; i < width; i++) {

        buf[i] = [];

        let x = (i / width) * 2 - 1;

        // process.stderr.write('\b\r' + Math.floor(100*(i / width)) + '%\n');

        for (let j = 0; j < height; j++) {

            let y = (j / height) * 2 - 1;

            raycaster.setFromCamera({x:x, y:y}, camera);

            let intersects = raycaster.intersectObjects(scene.children, true);

            let grey = 0;
            try {
                grey = intersects[0].faceIndex + 1;
                buf[i][j] = grey;
            } catch (e) {

            }
            // if( ++colorsOccurence[grey] > max) {
            //     max = colorsOccurence[grey];
            // }

            buf[i][j] = grey;

        }

    }

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
    frame++;

    if (!finished)
        loop();
}

