var BD = {};

BD.Private = {};
BD.Private.sendData = function(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
}

BD.Event = {};

BD.Event.ArrowClicked = function() {};
BD.Event.ArrowClicked.prototype.send = function() {
    var url = "/arrow-clicked";
    var data = {arrow_id: this.arrow_id};
    BD.Private.sendData(url, data);
}

BD.Event.CoinClicked = function() {};
BD.Event.CoinClicked.prototype.send = function() {
    var url = "/coin-clicked";
    var data = {coin_id: this.coin_id};
    BD.Private.sendData(url, data);
}

