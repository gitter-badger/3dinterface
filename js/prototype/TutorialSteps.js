var nextStep;
var TutorialSteps = function(tutoCamera, scene, coins, onWindowResize, container_size) {
    this.camera = tutoCamera;
    this.step = 0;
    this.coinNumber = 0;
    this.camera.allowed = {};
    this.onWindowResize = onWindowResize;
    this.container_size = container_size;
    this.coins = coins;

    this.instructions = [
        {
            text:"Welcome to this tutorial ! Click on <em>next</em> to go to the next instruction !",
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
            text: "Try pressing an arrow key on your keyboard to translate the camera !",
            justclick: false
        },
        {
            text: "There is a red coin on the top of the castle, just if front of you ! Go and get it !",
            justclick: false
        },
        {
            text: "You got it ! Try to click on reset camera !",
            justclick: false
        },
        {
            text: "Nice ! Let me introduce you to <emp>recommendations</em>",
            justclick: true
        },
        {
            text: "This is a recommendation, by hovering it, you should see a preview, and by clicking on it, you should go to the recommended viewpoint",
            justclick: false
        },
        {
            text: "The recommendation will change color once you clicked on it, just like a web link",
            justclick:true
        },
        {
            text: "Here are some more recommendations, try to browse the scene and find the missing red coins (5/8)",
            justclick:false
        },
        {
            text:"6/8 : you can use the arrow buttons to go to the previous / next position",
            justclick: false
        },
        {
            text: "7/8 ! Only one more !",
            justclick: false
        },
        {
            text: "Congratulations ! You've successfully finished the tutorial !",
            justclick: false
        }
    ];

    var self = this;
    nextStep = function() {self.nextStep();};

    this.scene = scene;
}

TutorialSteps.prototype.setCameras = function(cameras) {
    this.cameras = cameras;
}

TutorialSteps.prototype.nextStep = function() {
    if (this.step < this.instructions.length) {
        this.alert(this.instructions[this.step].text, this.instructions[this.step].justclick);
        var callback = function() {self.coinNumber++; self.nextStep();};
        var self = this;
        switch (this.step) {
            case 0: break;
            case 1: this.camera.allowed.mouseRotate       = true; break;
            case 2: this.camera.allowed.keyboardRotate    = true; break;
            case 3:
                this.camera.allowed.keyboardRotate    = true;
                this.coins.push(new Coin(0.4911245636058468,1.225621525492101,-5.11526684540265, callback));
                this.coins[this.coins.length-1].addToScene(this.scene);
                document.getElementById('container').appendChild(Coin.domElement);
                break;
            case 4:
                this.coins.push(new Coin(1.4074130964382279,0.6458319586843252,-6.75244526999632, callback));
                this.coins[this.coins.length-1].addToScene(this.scene);
                this.coins.push(new Coin(-4.2701659473968965,0.6745750513698942,-0.484545726832743, callback));
                this.coins[this.coins.length-1].addToScene(this.scene);
                this.coins.push(new Coin(-4.336597108439718,0.4203578350484251,-8.447211342176862, callback));
                this.coins[this.coins.length-1].addToScene(this.scene);
                break;
            case 7:
                this.camera.move(this.camera.resetElements);
                break;
            case 8:
                this.camera.allowed.keyboardTranslate = true;
                break;
            case 9:
                this.coins.push(new Coin(2.7378029903574026,2.953347730618792,-11.550836282321221, callback));
                this.coins[this.coins.length-1].addToScene(this.scene);
                this.camera.move({
                    position: new THREE.Vector3(-0.3528994281499122,-0.026355227893303856,-0.2766844454377826),
                    target: new THREE.Vector3(13.645394042405439,12.337463485871524,-35.64876053273249)
                });
                break;
            case 12:
                var cam = createPeachCameras(this.container_size.width(), this.container_size.height())[2];
                this.cameras.push(cam);
                cam.addToScene(this.scene);
                this.camera.move({
                    position: new THREE.Vector3(0.24120226734236713,0.2009624547018851,-0.5998422840047036),
                    target:  new THREE.Vector3(24.021711452218575,7.072419314071788,-32.020702608601745)
                });
                break;
            case 14:
                var cams = createPeachCameras(this.container_size.width(), this.container_size.height());
                for (var i = 0; i < cams.length; i == 1 ? i+=2 : i++) {
                    this.cameras.push(cams[i]);
                    cams[i].addToScene(this.scene);
                }

                this.coins.push(new Coin(3.701112872561801,-0.4620393514856378,-3.3373375945128085, callback));
                this.coins[this.coins.length-1].addToScene(this.scene);
                this.coins.push(new Coin(6.694675339780243,-1.2480369397526456,-1.992336719279164, callback));
                this.coins[this.coins.length-1].addToScene(this.scene);
                this.coins.push(new Coin(-2.458336118265302,-1.549510268763568,-11.186153614421212, callback));
                this.coins[this.coins.length-1].addToScene(this.scene);
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
        case 11: return 'reset-camera';
        case 13: return 'recommendation';
    }
}

TutorialSteps.prototype.tryFinish = function() {
    if (this.coinNumber === 8) {
        console.log("Finished");
    }
}

TutorialSteps.prototype.alert = function(myString, justclicked) {
    this.notify(myString, justclicked);
    this.onWindowResize();
}

TutorialSteps.prototype.notify = function(myString, justclick) {
    $('#alert-placeholder').html(
        '<div id="toto" class="alert alert-warning alert-dismissable">' +
            (justclick ?
            '<button type="button" class="close" aria-hidden="true"' +
                     'onclick="setTimeout(onWindowResize, 100); nextStep();' + '">' +
                '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
            '</button>' : '') +
            '<span><strong>' +
                myString +
                (justclick ?
                 ' <a href="#" onclick="setTimeout(onWindowResize, 100); nextStep();"><em>(next)</em></span>' : '' ) +
            '</strong></span>' +
        '</div>'
    )

    $('#toto').removeClass('alert-info').addClass('alert-danger');

    setTimeout(function() {
        $('#toto').removeClass('alert-danger').addClass('alert-warning');
    }, 500);
}
