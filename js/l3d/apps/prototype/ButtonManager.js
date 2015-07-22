var ButtonManager = function(camera, recommendations, previewer) {
    this.camera = camera;
    this.recommendations = recommendations;
    this.previewer = previewer;

    this.showArrows = true;
    this.beenFullscreen = false;

    // this.fullElement = document.getElementById('fullarrow');

    this.resetElement = document.getElementById('reset');
    this.undoElement = document.getElementById('undo');
    this.redoElement = document.getElementById('redo');

    this.pointerLockElement = document.getElementById('lock');
    this.showarrowsElement = document.getElementById('showarrows');

    // this.recommendationElement = document.getElementById('recommendation');

    (function(self) {
        self.undoElement.onclick = function() {self.camera.undo(); self.updateElements();};
        self.redoElement.onclick = function() {self.camera.redo(); self.updateElements();};

        // self.fullElement.onclick = function() {
        //     self.recommendations.map(function(camera) {
        //         if (!(camera instanceof PointerCamera)) {
        //             camera.fullArrow = self.fullElement.checked;
        //         }
        //     });

        // };

        self.pointerLockElement.onchange = function() {
            self.camera.shouldLock = self.pointerLockElement.checked;
            self.camera.onPointerLockChange();

            // Log (this will change option in the session)
            var bakup = L3D.DB.Private.enabled;
            if (!bakup)
                L3D.DB.enable();

            var event = new L3D.DB.Event.SwitchedLockOption();
            event.locked = self.pointerLockElement.checked;
            event.send();

            if (!bakup)
                L3D.DB.disable();
        };

        self.showarrowsElement.onchange = function() {self.showArrows = self.showarrowsElement.checked;};

        self.resetElement.onclick = function() {
            // Reinit camera
            self.camera.reset();
        };

        // self.recommendationElement.onchange = function() {
        //     previewer.fixedRecommendation(self.recommendationElement.checked);
        // };
    })(this);

};

ButtonManager.prototype.updateElements = function() {
    // Update icon
    if (!this.camera.undoable()) {
        this.undoElement.className = "btn btn-default navbar-btn";
    } else {
        this.undoElement.className = "btn btn-primary navbar-btn";
    }

    if (!this.camera.redoable()) {
        this.redoElement.className = "btn btn-default navbar-btn";
    } else {
        this.redoElement.className = "btn btn-primary navbar-btn";
    }
};

