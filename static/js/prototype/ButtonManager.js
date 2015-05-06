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
    this.resetElement.onclick = cameras.mainCamera().reset();

    (function(self) {
        self.undoElement.onclick = function() {cameras.mainCamera().undo(); self.updateElements();}
        self.redoElement.onclick = function() {cameras.mainCamera().redo(); self.updateElements();}

        self.fullElement.onclick = function() {
        cameras.map(function(camera) {
            if (!(camera instanceof PointerCamera)) {
                camera.fullArrow = self.fullElement.checked;
            }
        });

        self.collisionElement.onchange = function() {cameras.mainCamera().collisions = self.collisionElement.checked;}
        self.showarrowsElement.onchange = function() {self.showArrows = self.showarrowsElement.checked;}
        };
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

