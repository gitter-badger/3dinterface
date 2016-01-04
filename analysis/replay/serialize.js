"use strict";

require('app-module-path').addPath(__dirname + '/../../server/lib');

// REQUIRES AND INITS
let width =  Math.floor(1134) // /10);
let height = Math.floor(768 ) // /10);

let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
let THREE = require('three');
let Coin = require('./Coin.js');
let L3D = require('../../static/js/l3d.min.js');
let fs = require('fs');

let Matrix = require('Matrix');
let Serial = require('Serial');

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

let id = process.argv[2] === undefined ? 56 : parseInt(process.argv[2])
let laggy = true;

let info = {};


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
    var path = initElements(id);
    var outputName = path.split('/');
    outputName = outputName[outputName.length - 1].replace('.obj', '.json');
    loader = new L3D.ProgressiveLoader(
        path, new THREE.Object3D(), null
    );
    loader.load(
        function() {
            console.log("Loaded");
            Serial.serializeToFile(outputName, loader.obj);
        }
    );

}

function testDistance(old, newP) {

    return (
        L3D.Tools.norm2(L3D.Tools.diff(old.position, newP.position)) +
        L3D.Tools.norm2(L3D.Tools.diff(old.target, newP.target)) > 0.1
    );
}


function initElements(id) {
    switch (id) {
        case 1:
            return '/static/data/castle/princess peaches castle (outside)_sub.obj';
        case 2:
            return '/static/data/bobomb/bobomb battlefeild_sub.obj';
        case 3:
            return '/static/data/mountain/coocoolmountain_sub.obj';
        case 4:
            return '/static/data/whomp/Whomps Fortress_sub.obj';
        case 5:
            return '/static/data/sponza/sponza.obj';
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

