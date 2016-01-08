var CoinCanvas = (function() {

function instantToColor(instant) {

    var r = Math.floor(255 * instant);
    var g = Math.floor(255 * (1-instant));

    return 'rgb(' + r + ',' + g + ',0)';

}


var CoinCanvas = function() {

    this.domElement = document.createElement('canvas');
    this.ctx = this.domElement.getContext('2d');

    this.level = 0;
    this.blinking = false;
    this.blinkingToRed = true;
    this.colorInstant = 0;

    this.width = 10;
    this.height = 100;

};

CoinCanvas.prototype.setSize = function(w, h) {

    this.domElement.width = w;
    this.domElement.height = h;
    this.update();

};

CoinCanvas.prototype.update = function() {

    if (this.blinking) {

        this.colorInstant += this.blinkingToRed ? 0.025 : -0.025;

        if (this.colorInstant < 0 || this.colorInstant > 1) {

            this.colorInstant = Math.clamp(this.colorInstant, 0, 1);
            this.blinkingToRed = !this.blinkingToRed;

        }

    } else {

        this.colorInstant = 0;
        this.blinkingToRed = true;

    }

    // Some uggly stuff
    if (document.getElementById('next') !== null)
        document.getElementById('next').style.background = instantToColor(this.colorInstant);

};

CoinCanvas.prototype.render = function() {

    var x = this.domElement.width * 4.75 / 5;

    this.ctx.save();
    this.ctx.clearRect(x-70,20,this.width+71,this.height);

    this.ctx.fillStyle = instantToColor(this.colorInstant);
    this.ctx.fillRect(x,20 + (1-this.level)*this.height,10,(this.level*this.height));

    this.ctx.beginPath();
    this.ctx.moveTo(x,20);
    this.ctx.lineTo(x,120);
    this.ctx.lineTo(x+this.width,120);
    this.ctx.lineTo(x+this.width,20);
    this.ctx.stroke();

    this.ctx.fillStyle = 'black';
    this.ctx.font="20px Arial";
    this.ctx.fillText('Score', x - 60, 25);

    this.ctx.restore();

};

CoinCanvas.prototype.setLevel = function(newLevel) {

    this.level += 0.01 * Math.sign(newLevel - this.level);

    if (Math.abs(this.level - newLevel) > 0.005) {

        var self = this;
        setTimeout(function() { self.setLevel(newLevel); }, 50);

    }

};

CoinCanvas.prototype.blink = function(param) {

    this.blinking = param === undefined ? true : !!param;

}

return CoinCanvas;

})();
