#!/usr/bin/node
var pgc = require('../private.js');

var url = pgc.url;

require('./loadTables.js')(url, function(db) {

    console.log(JSON.stringify(db));

});
