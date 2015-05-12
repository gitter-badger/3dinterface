var ButtonManager = function(cameras) {
    this.cameras = cameras;

    this.showArrows = true;
    this.beenFullscreen = false;

    this.fullscreenElement = document.getElementById('full');
    this.fullElement = document.getElementById('fullarrow');
    this.resetElement = document.getElementById('reset');
    this.undoElement = document.getElementById('undo');
    this.redoElement = document.getElementById('redo');

    this.collisionElement = document.getElementById('collisions');
    this.showarrowsElement = document.getElementById('showarrows');

    this.fullscreenElement.onclick = function() {};

    (function(self) {
        self.undoElement.onclick = function() {self.cameras.mainCamera().undo(); self.updateElements();}
        self.redoElement.onclick = function() {self.cameras.mainCamera().redo(); self.updateElements();}

        self.fullElement.onclick = function() {
            self.cameras.map(function(camera) {
                if (!(camera instanceof PointerCamera)) {
                    camera.fullArrow = self.fullElement.checked;
                }
            });

        };

        self.collisionElement.onchange = function() {self.cameras.mainCamera().collisions = self.collisionElement.checked;}
        self.showarrowsElement.onchange = function() {self.showArrows = self.showarrowsElement.checked;}
        self.resetElement.onclick = function() {self.cameras.mainCamera().reset();}
    })(this);

}

ButtonManager.prototype.updateElements = function() {
    // Update icon
    if (!this.cameras.mainCamera().undoable()) {
        this.undoElement.className = "btn btn-default";
    } else {
        this.undoElement.className = "btn btn-primary";
    }

    if (!this.cameras.mainCamera().redoable()) {
        this.redoElement.className = "btn btn-default";
    } else {
        this.redoElement.className = "btn btn-primary";
    }
}

