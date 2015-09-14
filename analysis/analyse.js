var pgc = require('../private.js');
var db = require('./loadTables.js')(pgc.url, function() {

    console.log(db.users);

});
