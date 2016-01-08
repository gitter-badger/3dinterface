// Auto-resize case
// var mainSection = document.getElementById('main-section');
//
// var containerSize = {
//     width: function() { if (!isFullscreen) return mainSection.clientWidth; else return screen.width;},
//     height: function() {
//         if (!isFullscreen)
//             return mainSection.clientHeight
//                 - document.getElementById('nav').offsetHeight
//                 - document.getElementById('main-div').offsetHeight;
//         else
//             return screen.height;
//     }
// };

var containerSize = {

    width: function() { return 1134; },
    height: function() { return 768; }

};

function logfps(fps) {
    var event = new L3D.DB.Event.Fps();
    event.fps = fps;
    event.send();
}

function objectClickerOnHover(camera1, previewer, recommendations, container) {

    var hoveredCamera = null;

    return function(c, x, y) {

        var obj = c !== undefined ? c.object : undefined;

        // Check if the object is clickable
        var ok = obj instanceof Coin || obj instanceof L3D.BaseRecommendation;

        // Little graphic stuff so the user knows that it's clickable
        container.style.cursor = ok ? "pointer" : "auto";
        if (camera1.pointerLocked)
            camera1.mousePointer.render(ok ? L3D.MousePointer.RED : L3D.MousePointer.BLACK);

        // Set previewer for preview
        previewer.setCamera(obj instanceof L3D.BaseRecommendation ? obj.camera : null);
        previewer.setPosition(x,y);

        // Manage the hover camera event
        if (hoveredCamera !== obj) {

            var event = new L3D.DB.Event.Hovered();

            if (obj instanceof L3D.BaseRecommendation) {
                // The newly hovered object is different and is a recommendation

                event.arrowId = recommendations.indexOf(obj);
                event.start = true;
                event.send();

                hoveredCamera = obj;

            } else if (hoveredCamera instanceof L3D.BaseRecommendation) {

                // The newly hovered object is not a recommendation,
                // but the previous one is : we must log

                // Unhovered
                event.arrowId = 0;
                event.start = false;
                event.send();

                hoveredCamera = null;

            }

        }

    };

}

function objectClickerOnClick(camera1, buttonManager, recommendations, coins) {

    return function(c, x, y) {

        var event;
        var obj = c !== undefined ? c.object : undefined;

        // Do stuff for click
        if (obj instanceof Coin) {

            obj.get();

            // Send event to DB
            event = new L3D.DB.Event.CoinClicked();
            event.coinId = obj.id;
            event.send();

        } else if (obj instanceof L3D.BaseRecommendation) {

            obj.check();

            // Send event to DB
            event = new L3D.DB.Event.ArrowClicked();
            event.arrowId = recommendations.indexOf(obj);
            event.send();

            camera1.moveHermite(obj, undefined, event.arrowId);

        }

        // Update the button manager
        buttonManager.updateElements();

    };

}

function createVisibilityFunction(value) {
    return function(object) {
        object.traverse(function(object) {
            object.visible = value;
        });
    };
}

function resetCameraAspect(camera, width, height) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

var show = createVisibilityFunction(true);
var hide = createVisibilityFunction(false);

function resizeElements() {

    var width = containerSize.width(), height = containerSize.height();

    for (var i = 0; i < arguments.length; i++) {

        var obj = arguments[i];

        if (obj == null) {
            return;
        }

        if (obj instanceof Element) {

            obj.style.width = width + 'px';
            obj.style.height = height + 'px';
            continue;
        }

        if (obj.domElement) {

            obj.setSize(width, height);

        }

    }

}

function appendTo(container) {

    return function() {

        for (var i = 0; i < arguments.length; i++) {

            if (arguments[i] != null)
                container.appendChild(arguments[i].domElement);

        }

    };

}

function setNextButton(target, coinCanvas) {

    if (coinCanvas !== 'undefined')
        coinCanvas.blink();

    $('#next').show();
    $('#next').click(function() {
        window.location = target;
        $('#next').prop('disabled', true);
    });
}
