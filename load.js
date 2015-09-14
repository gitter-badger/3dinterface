function makeId()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var fs = require('fs');

var casper = require('casper').create({
    stepTimeout: 100000,
    waitTimeout: 100000
});

var limit = 100;

casper.start('http://localhost:4000/');

for (var i = 0; i < limit; i++) {

    (function(i) {

        casper.thenOpen('http://localhost:4000/user-study', function() {

            console.log(i);

            this.getHTML();

            // this.waitForSelector('form#form', function() {

                this.fillSelectors(
                    'form#form', {
                        '#inputId': makeId(),
                        '#sel1': '-15',
                        '#sel2': '3'
                    }, true
                );

            // }, true);

            this.thenOpen('http://localhost:4000/prototype/game');
            this.thenOpen('http://localhost:4000/prototype/game');
            this.thenOpen('http://localhost:4000/prototype/game');
            this.thenOpen('http://localhost:4000/prototype/game');

            this.thenOpen('http://localhost:4000/logout');

        });

    })(i);

}

casper.run();
