var nextStep;
var TutorialSteps = function(tutoCamera, scene, coins, onWindowResize, containerSize, clickableObjects) {
    this.camera = tutoCamera;
    this.step = 0;
    this.coinNumber = 0;
    this.camera.allowed = {};
    this.onWindowResize = onWindowResize;
    this.containerSize = containerSize;
    this.coins = coins;
    this.clickableObjects = clickableObjects;

    this.instructions = [
        {
            text:"Welcome to the tutorial.  Click anywhere on the canvas to start.  You will enter into the 'pointer lock' mode",
            justclick:false
        },
        {
            text: "Move your mouse to look around.  Press the escape key to unlock the pointer.",
            justclick: false
        },
        {
            text: "You can also uncheck the <em>lock pointer</em> option at the bottom of the page to unlock the pointer.",
            justclick: false
        },
        {
            text:"Now, the pointer is unlocked.  Click and drag your mouse to look around.",
            justclick:false
        },
        {
            text:"Nice! You can also use the (2,4,6 and 8) keys or (k,j,l and i) keys to look around.",
            justclick: true
        },
        {
            text: "Here is a red coin, click on it!",
            justclick: false
        },
        {
            text: "Nice, there are a 3 more red coins around you, try to get them! Check the gauge (your score)!  You can lock the pointer if you wish.",
            justclick: false
        },
        {
            text: "Two more! Move the camera with the mouse around you to find them !",
            justclick: false
        },
        {
            text: "One more! Move the camera with the mouse around you to find them !",
            justclick: false
        },
        {
            text:"Nice! You will now learn to navigate in the scene.",
            justclick: true
        },
        {
            text: "Press one of the arrow keys on your keyboard to move!",
            justclick: false
        },
        {
            text: "There is a red coin on the roof of the castle, just in front of you! Go and get it!",
            justclick: false
        },
        {
            text: "You got it! Now, click on the 'reset camera' button!",
            justclick: false
        },
        {
            text: "Nice! Let me introduce you to <em>recommendations</em>",
            justclick: true
        },
        {
            text: "This is a recommendation, by hovering it, you should see a preview, and by clicking on it, you will automatically move towards the recommended viewpoint.  Click on this recommendation to try.",
            justclick: false
        },
        {
            text: "The recommendation will change color once you clicked on it, just like a web link.",
            justclick:true
        },
        {
            text: "Recommendations can be displayed as 3D arrows like the one you just saw, or as viewports like this one.  Click on this recommendation to proceed.",
            justclick: false
        },
        {
            text: "Here are some more recommendations, try to browse the scene and find the missing red coins",
            justclick:false
        },
        {
            text:"Tip: You can use the previous / next buttons in the control bar at the bottom of the screen to go to the previous / next position",
            justclick: false
        },
        {
            text: "Tip: You can use the previous / next buttons in the control bar at the bottom of the screen to go to the previous / next position",
            justclick: false
        },
        {
            text: "Tip: You can use the previous / next buttons in the control bar at the bottom of the screen to go to the previous / next position",
            justclick: false
        },
        {
            text: "Tip: You can use the previous / next buttons in the control bar at the bottom of the screen to go to the previous / next position",
            justclick: false
        },
        {
            text: "Tip: You can use the previous / next buttons in the control bar at the bottom of the screen to go to the previous / next position",
            justclick: false
        },
        {
            text: "Tip: You can use the previous / next buttons in the control bar at the bottom of the screen to go to the previous / next position",
            justclick: false
        },
        {
            text: "Tip: You can use the previous / next buttons in the control bar at the bottom of the screen to go to the previous / next position",
            justclick:false
        },
        {
            text: "Congratulations! You've successfully collected all the coins and completed the tutorial ! Click on the colored button at the bottom of the page to continue!",
            justclick: false
        }
    ];

    var self = this;
    nextStep = function() {self.nextStep();};

    this.scene = scene;

    window.coinCanvas = this.coinCanvas = new CoinCanvas();
};

TutorialSteps.prototype.setCameras = function(cameras) {
    this.cameras = cameras;
};

TutorialSteps.prototype.addCoin = function(x,y,z,callback) {
    this.scene.createCoin({x:x, y:y, z:z}, undefined, undefined, callback);
    // this.scene.addCoin(coin);
    // this.coins.push(coin);
    // coin.visible = true;
    // coin.addToScene(this.scene);
    // this.clickableObjects.push(coin);
};

TutorialSteps.prototype.addRecommendation = function(Class, recoId) {

    this.scene.createRecommendation(Class, this.containerSize.width(), this.containerSize.height(), recoId);

};

TutorialSteps.prototype.nextStep = function() {
    if (this.step < this.instructions.length) {
        this.alert(this.instructions[this.step].text, this.instructions[this.step].justclick);
        var callback = function() {self.coinNumber++; self.nextStep();};
        var self = this;
        switch (this.step) {
            case 0: break;
            case 3: this.camera.allowed.mouseRotate       = true; break;
            case 4:
                this.camera.allowed.keyboardRotate = true;
            break;
            case 5:
                if (!confirm('Do you want to keep pointer lock disabled ?')) {
                    document.getElementById('lock').checked = true;
                    this.camera.shouldLock = true;
                    this.camera.onPointerLockChange();
                }

                // Block camera
                for (var key in this.camera.motion) {
                    this.camera.motion[key] = false;
                }

                this.coinCanvas.domElement.style.display = "";
                Coin.max = 1;
                this.coinCanvas.update();
                this.camera.allowed.keyboardRotate    = true;
                this.addCoin(0.4911245636058468,1.225621525492101,-5.11526684540265, callback);

                // Initialize coin counter
                $('#container').prepend(this.coinCanvas.domElement);
                // document.getElementById('container').preppendChild(this.coinCanvas.domElement);
                this.coinCanvas.domElement.style.position = 'absolute';
                this.coinCanvas.domElement.style.cssFloat = 'top-left';
                this.coinCanvas.setSize(containerSize.width(), containerSize.height());
                break;
            case 6:
                Coin.max = 4;
                this.coinCanvas.update();
                this.addCoin(1.4074130964382279,0.6458319586843252,-6.75244526999632, callback);
                this.addCoin(-4.2701659473968965,0.6745750513698942,-0.484545726832743, callback);
                this.addCoin(-4.336597108439718,0.4203578350484251,-8.447211342176862, callback);
                break;
            case 9:
                this.camera.move(this.camera.resetElements);
                break;
            case 10:
                this.camera.allowed.keyboardTranslate = true;
                break;
            case 11:
                Coin.max = 5;
                this.coinCanvas.setLevel(Coin.total / Coin.max);
                this.addCoin(2.7378029903574026,2.953347730618792,-11.550836282321221, callback);
                this.camera.move({
                    position: new THREE.Vector3(-0.3528994281499122,-0.026355227893303856,-0.2766844454377826),
                    target: new THREE.Vector3(13.645394042405439,12.337463485871524,-35.64876053273249)
                });
                break;
            case 14:
                this.addRecommendation(L3D.ArrowRecommendation, 0);
                this.firstReco = this.scene.recommendations[0];
                this.camera.move({
                    position: new THREE.Vector3(-9.157274598933608,3.6852142459329533,2.1820896816244444),
                    target: new THREE.Vector3(28.719309042259358,-7.287186618613339,-4.523939765031559)
                });
                break;
            case 16:
                this.addRecommendation(L3D.ViewportRecommendation, 1);
                this.secondReco = this.scene.recommendations[1];
                this.camera.move({
                    position: new THREE.Vector3(-4.450089930098798,1.9849620256150362,-6.290933967410013),
                    target: new THREE.Vector3(-41.36549967804652,3.333580368597787,-21.63478458275742)
                });
                break;
            case 17:
                for (var i = 2; i < PeachScene.recommendations.length; i++) {
                    this.addRecommendation(L3D.ArrowRecommendation, i);
                }
                Coin.total = 0;
                Coin.max = 8;
                this.coinCanvas.setLevel(Coin.total / Coin.max);
                var currentCoin = this.scene.coins;
                this.scene.addCoins(GLOB.coinConfig);
                for (i = currentCoin; i < this.scene.coins.length; i++) {
                    this.scene.coins[i].callback = callback;
                }
                break;
        }
        this.step++;
    }
};

TutorialSteps.prototype.nextAction = function() {
    switch (this.step) {
        case  1: return 'lock-pointer';
        case  2: return 'unlock-pointer';
        case  3: return 'uncheck-lock';
        case  4: return 'rotate-mouse';
        case  5: return 'rotate-keyboard';
        case 11: return 'translate-keyboard';
        case 13: return 'reset-camera';
        case 15: return 'recommendation';
        case 16: return;
        case 17: return 'recommendation';
    }
};

TutorialSteps.prototype.tryFinish = function() {
    if (this.coinNumber === 8) {
        console.log("Finished");
    }
};

TutorialSteps.prototype.alert = function(myString, justclicked) {
    this.notify(myString, justclicked);
    this.onWindowResize();
};

TutorialSteps.prototype.notify = function(myString, justclick) {
    $('#alert-placeholder').html(
        '<div id="toto" class="alert alert-info alert-dismissable">' +
            (justclick ?
            '<button type="button" class="close" aria-hidden="true"' +
                     'onclick="setTimeout(onWindowResize, 100); nextStep();' + '">' +
                '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
            '</button>' : '') +
            '<span><strong>' +
                myString +
                (justclick ?
                 ' <a href="#" onclick="setTimeout(onWindowResize, 100); nextStep();"><em>Click here to continue the tutorial. </em></span>' : '' ) +
            '</strong></span>' +
        '</div>'
    );

    $('#toto').removeClass('alert-info').addClass('alert-danger');

    setTimeout(function() {
        $('#toto').removeClass('alert-danger').addClass('alert-info');
        setTimeout(function() {
            $('#toto').removeClass('alert-info').addClass('alert-danger');
            setTimeout(function() {
                $('#toto').removeClass('alert-danger').addClass('alert-info');
            }, 700);
        }, 700);
    }, 700);
};
