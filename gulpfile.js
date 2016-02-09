var fs = require('fs');
var path = require('path');

fs.readdirSync(path.join(__dirname, 'tasks')).forEach(function(name) {

    require(path.join(__dirname, 'tasks', name));

});

