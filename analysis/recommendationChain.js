#!/usr/bin/node

"use strict";

var fs = require('fs');

var lib = require('./lib.js');

function zeros(lines, columns) {

    if (columns === undefined)
        columns = lines;

    var ret = [];

    for(var i=0; i<lines; i++) {
        ret[i] = [];
        for(var j=0; j<columns; j++) {
            ret[i][j] = 0;
        }
    }

    return ret;

}

function normalize(mat) {
    // Normalize the matrices
    var max = 0;
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[i].length; j++) {
            if (mat[i][j] > max)
                max = mat[i][j];
        }
    }

    return mat.map(function(line) { return line.map(function(num) { return num / (2 * max) })});


}

function main(path) {

    // Generated with ./test.pgsql | tail -n+3 | head -n-2 | cut -d '|' -f 2 | sort -g | tr '\n' ' ' | tr -s ' ' | tr ' ' ','
    var recoExps = [10,27,28,57,68,83,127,129,145,192,205,206,209,210,212,214,236,240,247,259];

    var db = lib.loadFromFile(path);
    var mat1 = zeros(12); // Bombomb
    var mat2 = zeros(12); // Mountain
    var mat3 = zeros(11); // Whomp

    var matt1 = zeros(12); // Bombomb
    var matt2 = zeros(12); // Mountain
    var matt3 = zeros(11); // Whomp

    for (var expIndex = 0; expIndex < db.experiments.length; expIndex++) {

        var exp = db.experiments[expIndex];
        var coinCombination = db.coinCombinations[exp.coin_combination_id - 1];
        let mat, matt;

        switch (coinCombination.scene_id) {

            case 1: continue; // Continue the loop
            case 2: mat = mat1; matt = matt1; break;
            case 3: mat = mat2; matt = matt2; break;
            case 4: mat = mat3; matt = matt3; break;
            default: continue;

        }

        var prev = 0; // 0 is the reset camera
        var next = null;

        for (var evtIndex = 0; evtIndex < exp.elements.events.length; evtIndex++) {

            var evt = exp.elements.events[evtIndex];

            if (evt.type === 'reset') {
                prev = 0;
                continue;
            }

            if (evt.type === 'arrow') {
                next = evt.id + 1;
                if (prev !== next) {
                    mat[prev][next]++;
                    if (recoExps.indexOf(exp.id) !== -1) {
                        matt[prev][next]++;
                    }
                }


                // Update prev
                prev = next;
                next = null;
            }



        }

    }

    mat1 = normalize(mat1);
    mat2 = normalize(mat2);
    mat3 = normalize(mat3);

    fs.writeFile('mat1.dat', lib.toLaTeXMatrix(mat1), function(e) {});
    fs.writeFile('mat2.dat', lib.toLaTeXMatrix(mat2), function(e) {});
    fs.writeFile('mat3.dat', lib.toLaTeXMatrix(mat3), function(e) {});

    matt1 = normalize(matt1);
    matt2 = normalize(matt2);
    matt3 = normalize(matt3);

    fs.writeFile('matt1.dat', lib.toLaTeXMatrix(matt1), function(e) {});
    fs.writeFile('matt2.dat', lib.toLaTeXMatrix(matt2), function(e) {});
    fs.writeFile('matt3.dat', lib.toLaTeXMatrix(matt3), function(e) {});
}

if (process.argv.length !== 3) {
    process.stderr.write('Error : please give me a JSON file to work on\n');
    process.exit(-1);
}

main(process.argv[2])
