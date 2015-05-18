var BD = {};

BD.Event = {};

BD.Event.ArrowClicked = function() {};
BD.Event.ArrowClicked.prototype.send = function() {
    var url = "/post";

    var data = {};

    data.user_id = this.user_id;
    data.arrow_id = this.arrow_id;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));

};

