#!/usr/bin/node
// Shows with and without : time to last coin = f(CoinCombination)

var lib = require('./lib.js');


function main(path) {

    var db = lib.loadFromFile(path);
    var groups = lib.makeGroups(db);

    // Erase groups that are not usable
    groups = groups.filter(function(elt) {

        // An elt is valid if it contains at least 2 exp, BaseRecommendation included
        return elt.length > 1 && elt.find(function(e) { return e.recommendation_style[4] === 'B'; }) !== undefined;

    });

    groups.forEach(function(elt) {
        elt.sort(lib.compareRecommendationStyle);

        if (elt.length === 2 && elt[1].recommendation_style[4] === 'V') {
            elt[2] = elt[1];
            elt[1] = undefined;
        }
    });

    groups.sort(function(elt1, elt2) {

        el1 = [];
        el2 = [];

        if (elt1[0] === undefined) el1[0] = {user:{}}; else el1[0] = elt1[0];
        if (elt1[1] === undefined) el1[1] = {user:{}}; else el1[1] = elt1[1];
        if (elt1[2] === undefined) el1[2] = {user:{}}; else el1[2] = elt1[2];

        if (elt2[0] === undefined) el2[0] = {user:{}}; else el2[0] = elt2[0];
        if (elt2[1] === undefined) el2[1] = {user:{}}; else el2[1] = elt2[1];
        if (elt2[2] === undefined) el2[2] = {user:{}}; else el2[2] = elt2[2];


        var r1 = el1[0].user.rating || el1[1].user.rating;
        var r2 = el2[0].user.rating || el2[1].user.rating;

        return r1 - r2;;
    });

    // console.log(lib.toMatlabArray('X', lib.range(0, groups.length)));

    var header =
        '\\begin{axis}[\n'
        + '    ybar,\n'
        + '    enlargelimits=0.05,\n'
        + '    legend style={at={(0.5,-0.15)},\n'
        + '        anchor=north,legend columns=-1},\n'
        + '    ylabel={Number of interactions},\n'
        + '    xlabel={Groups sharing the same coin combination},\n'
        + '    symbolic x coords={ ';

    for (var i = 0; i < groups.length; i++) {
        header += i + (i === groups.length -1 ? '' : ',');
    }
            1,2,3,4,5,6,7,8,9,10

    header += '},\n'
        + '    xtick=data,\n'
        + '    nodes near coords,\n'
        + '    width=32cm,\n'
        + '    height=10cm,\n'
        + '    % nodes near coords align5={vertical},\n'
        + ']\n';

    console.log(header);


    console.log(lib.toLaTeXCoordinate('Y1', lib.range(0, groups.length, function(i) {
        return lib.numberOfInteraction(groups[i][0]);
    })));

    console.log(lib.toLaTeXCoordinate('Y2', lib.range(0, groups.length, function(i) {
        return lib.max(lib.numberOfInteraction(groups[i][1]), 0);
    })));

    console.log(lib.toLaTeXCoordinate('Y3', lib.range(0, groups.length, function(i) {
        return lib.max(0, lib.numberOfInteraction(groups[i][2]));
    })));

    console.log('\\legend{Without reco, With viewports, With arrows}');
    console.log('\\end{axis}');

}

if (process.argv.length !== 3) {
    process.stderr.write('Error : please give me a JSON file to work on\n');
    process.exit(-1);
}

main(process.argv[2]);

