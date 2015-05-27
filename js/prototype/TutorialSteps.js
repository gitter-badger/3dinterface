var TutorialSteps = function(tutoCamera) {
    this.camera = tutoCamera;
    this.step = 0;
    this.camera.allowed = {};

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
            text:"Nice ! You can try to use the keyboard arrows to move the camera",
            justclick: true
        }
    ];

}

TutorialSteps.prototype.nextStep = function() {
    if (this.step < this.instructions.length) {
        this.alert(this.instructions[this.step].text, this.instructions[this.step].justclick);
        switch (this.step) {
            case 0: break;
            case 1: this.camera.allowed.mouseRotate       = true; break;
            case 2: this.camera.allowed.keyboardRotate    = true; break;
            case 3:
                this.camera.allowed.keyboardRotate    = true;
                var self = this;
                coins.push(new Coin(0.4911245636058468,1.225621525492101,-5.11526684540265, function() {
                    self.nextStep();
                }));
                coins[coins.length-1].addToScene(scene);
                break;
            case 4: this.camera.allowed.keyboardTranslate = true; break;
        }
        this.step++;
    }
}

TutorialSteps.prototype.nextAction = function() {
    switch (this.step) {
        case 2: return 'rotate-mouse';
        case 3: return 'rotate-keyboard';
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
