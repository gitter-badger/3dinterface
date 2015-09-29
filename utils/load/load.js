var baseUrl = 'http://localhost:4000/';
var baseUrl = 'http://3dinterface.no-ip.org/';

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

casper.start(baseUrl);

for (var i = 0; i < limit; i++) {

    (function(i) {

        casper.thenOpen(baseUrl + 'user-study', function() {

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

            this.thenOpen(baseUrl + 'prototype/tutorial');
            this.thenOpen(baseUrl + 'prototype/play');
            this.thenOpen(baseUrl + 'prototype/play');
            this.thenOpen(baseUrl + 'prototype/play');

            this.thenOpen(baseUrl + 'logout');

        });

    })(i);

}

casper.run();
