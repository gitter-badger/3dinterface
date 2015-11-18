"use strict";

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

let fs = require('fs');
let THREE = require('./three.js');

let width =  Math.floor(1134);
let height = Math.floor(768);

let renderer = new THREE.CanvasRenderer();
renderer.domElement.style = renderer.domElement;
renderer.setSize(width,height);
renderer.setClearColor(0x000000);

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
camera.position.z = 1000;

let geometry = new THREE.BoxGeometry(200, 200, 200);
let material = new THREE.MeshBasicMaterial({color: 0xff0000});

let mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
scene.add(camera);

let counter = 0;
for (let i = 0; i < 1; i += 0.005) {

    mesh.rotation.x = i * 2 * Math.PI;
    mesh.rotation.y = i * Math.PI;

    camera.lookAt(new THREE.Vector3());

    renderer.render(scene, camera);

    console.log(i);
    fs.writeFileSync(__dirname + '/' + pad(counter++, 4) + '.png', renderer.domElement.toBuffer());
}
