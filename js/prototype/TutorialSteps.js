var TutorialSteps = function(tutoCamera) {
    this.camera = tutoCamera;
    this.step = 0;
    this.coins = 0;
    this.camera.allowed = {};
    this.camera.allowed.keyboardTranslate = true;

    this.instructions = [
        {
            text:"Welcome to this tutorial ! Click on the right arrow to go to the next instruction !",
            justclick:true
        },
        {
            text:"You can use your mouse (drag'n'drop) to rotate the camera",
            justclick:false
        },
        {
            text:"Nice ! You can also use (2,4,6 and 8) keys or (k,j,l and i)",
            justclick: true
        },
        {
            text: "Here is a red coin, click on it !",
            justclick: false
        },
        {
            text: "Nice, there are a few coins around you, try to get them ! 1/4",
            justclick: false
        },
        {
            text: "2/4",
            justclick: false
        },
        {
            text: "3/4",
            justclick: false
        },
        {
            text:"Nice ! You will now learn to translate the camera",
            justclick: true
        },
        {
            text: "Try pressing the up key to go forward !",
            justclick: false
        },
        {
            text: "There is a red coin on the top of the castle ! Try to find it by targetting the place where you want to go with the mouse, and then using the arrow keys to go there",
            justclick: false
        },
        {
            text: "You got it ! I think you're ready to play !",
            justclick: false
        }
    ];

}

TutorialSteps.prototype.nextStep = function() {
    if (this.step < this.instructions.length) {
        this.alert(this.instructions[this.step].text, this.instructions[this.step].justclick);
        var callback = function() {self.coins++; self.nextStep();};
        var self = this;
        switch (this.step) {
            case 0: break;
            case 1: this.camera.allowed.mouseRotate       = true; break;
            case 2: this.camera.allowed.keyboardRotate    = true; break;
            case 3:
                this.camera.allowed.keyboardRotate    = true;
                coins.push(new Coin(0.4911245636058468,1.225621525492101,-5.11526684540265, function() {
                    self.nextStep();
                    self.coins++;
                }));
                coins[coins.length-1].addToScene(scene);
                break;
            case 4:
                coins.push(new Coin(-0.670782299402527,1.847042640633274,1.562644363633795, callback));
                coins[coins.length-1].addToScene(scene);
                coins.push(new Coin(-4.2701659473968965,0.6745750513698942,-0.484545726832743, callback));
                coins[coins.length-1].addToScene(scene);
                coins.push(new Coin(-4.336597108439718,0.4203578350484251,-8.447211342176862, callback));
                coins[coins.length-1].addToScene(scene);
                break;
            case 7:
                this.camera.move(this.camera.resetElements);
                this.camera.allowed.keyboardTranslate = true;
                break;
            case 8:
                coins.push(new Coin(2.7378029903574026,2.953347730618792,-11.550836282321221, callback));
                coins[coins.length-1].addToScene(scene);
                break;
        }
        this.step++;
    }
}

TutorialSteps.prototype.nextAction = function() {
    switch (this.step) {
        case 2: return 'rotate-mouse';
        case 3: return 'rotate-keyboard';
        case 9: return 'translate-keyboard';
    }
}

TutorialSteps.prototype.tryFinish = function() {
    if (this.coins === 8) {
        console.log("Finished");
    }
}

TutorialSteps.prototype.alert = function(myString, justclicked) {
    this.notify(myString, justclicked);
    onWindowResize();
}

TutorialSteps.prototype.notify = function(myString, justclick) {
    $('#alert-placeholder').html(
        '<div class="alert alert-warning alert-dismissable">' +
            (justclick ?
            '<button type="button" class="close" aria-hidden="true"' +
                     'onclick="setTimeout(onWindowResize, 100); tutorial.nextStep();' + '">' +
                '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
            '</button>' : '') +
            '<span>' +
                myString +
            '</span>' +
        '</div>'
    );
}
