"use strict";

let fs = require('fs');
let THREE = require('three');
let L3D = require('../static/js/l3d.min.js');

function serialize(object) {

    let data = {};

    data.vertices = object.children[0].geometry.vertices;

    data.children = [];

    for (let objChild of object.children) {

        let newChild = {};

        // newChild.faceVertexUvs = objChild.geometry.faceVertexUvs;
        newChild.faces = objChild.geometry.faces;

        data.children.push(newChild);

    }

    return JSON.stringify(data);

}

function deserialize(str) {

    let parse = JSON.parse(str);
    let vertices = [];
    let material = new THREE.MeshBasicMaterial();

    let ret = new THREE.Object3D();

    for (let vertex of parse.vertices) {

        vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));

    }


    for (let parseChild of parse.children) {

        let geometry = new THREE.Geometry();
        geometry.vertices = vertices;

        for (let face of parseChild.faces) {

            geometry.faces.push(new THREE.Face3(face.a, face.b, face.c));

        }

        geometry.computeBoundingSphere();
        let newChild = new THREE.Mesh(geometry, material);

        ret.children.push(newChild);
    }

    return ret;

}

function serializeToFile(path, obj) {

    fs.writeFileSync(path, serialize(obj));

}

function loadFromFile(path) {

    return deserialize(fs.readFileSync(path, 'utf-8'));

}

module.exports.serialize = serialize;
module.exports.deserialize = deserialize;
module.exports.serializeToFile = serializeToFile;
module.exports.loadFromFile = loadFromFile;

function main() {

    let loader = new L3D.ProgressiveLoader(
        '/static/data/castle/princess peaches castle (outside).obj',
        new THREE.Object3D(),
        null
    );

    loader.load(function() {
        console.log("Loaded");
        // console.log(loader.obj.children[0].geometry);
        deserialize(serialize(loader.obj));
    });

}

if (require.main === module) {
    main();
}
