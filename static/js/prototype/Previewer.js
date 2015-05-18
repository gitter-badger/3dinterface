var Previewer = function(renderer) {
    this.domElement = document.createElement('canvas');
    this.ctx = this.domElement.getContext('2d');
    this.renderer = renderer;
    this.fixed = false;
}

Previewer.prototype.render = function(prev, container_width, container_height) {
    var width, height, left, bottom;

    if (prev.go) {
        width  = Math.floor(container_width / 5);
        height = Math.floor(container_height / 5);
        if (!this.fixed) {
            left = Math.floor(prev.x - width/2);
            bottom = Math.floor(this.renderer.domElement.height - prev.y + height/5);
        } else {
            left = 0;
            bottom = 0;
        }

        // Draw border
        var can_bottom = container_height - bottom - height ;
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.moveTo(left-1, can_bottom);
        this.ctx.lineTo(left-1, can_bottom + height);
        this.ctx.lineTo(left + width-1, can_bottom + height);
        this.ctx.lineTo(left + width-1, can_bottom);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.strokeStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.moveTo(left, can_bottom + 1);
        this.ctx.lineTo(left, can_bottom + height - 1);
        this.ctx.lineTo(left + width - 2 , can_bottom + height-1);
        this.ctx.lineTo(left + width - 2, can_bottom+1);
        this.ctx.closePath();
        this.ctx.stroke();

        // Do render in previsualization
        prev.camera.look();
        this.renderer.setScissor(left, bottom, width, height);
        this.renderer.enableScissorTest(true);
        this.renderer.setViewport(left, bottom, width, height);
        this.renderer.render(scene, prev.camera);

        if (!this.fixed) {
            this.clearNeeded = true;
        }
    } else if (this.fixed) {
        this.clearNeeded = true;
    }
}

Previewer.prototype.clear = function() {
    if (this.clearNeeded) {
        this.domElement.width = this.domElement.width;
        this.clearNeeded = false;
    }
}

Previewer.prototype.fixedRecommendation = function(bool) {
    this.fixed = bool;
}
