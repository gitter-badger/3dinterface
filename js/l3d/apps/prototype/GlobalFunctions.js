// Auto-resize case
// var main_section = document.getElementById('main-section');
//
// var container_size = {
//     width: function() { if (!isFullscreen) return main_section.clientWidth; else return screen.width;},
//     height: function() {
//         if (!isFullscreen)
//             return main_section.clientHeight
//                 - document.getElementById('nav').offsetHeight
//                 - document.getElementById('main-div').offsetHeight;
//         else
//             return screen.height;
//     }
// };

var container_size = {

    width: function() { return 1134; },
    height: function() { return 768; }

};

function logfps(fps) {
    var event = new L3D.BD.Event.Fps();
    event.fps = fps;
    event.send();
}

function objectClickerOnHover(camera1, previewer, recommendations, container) {

    var hoveredCamera = null;

    return function(obj, x, y) {

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

            var event = new L3D.BD.Event.Hovered();

            if (obj instanceof L3D.BaseRecommendation) {
                // The newly hovered object is different and is a recommendation

                event.arrow_id = recommendations.indexOf(obj);
                event.start = true;
                event.send();

                hoveredCamera = obj;

            } else if (hoveredCamera instanceof L3D.BaseRecommendation) {

                // The newly hovered object is not a recommendation,
                // but the previous one is : we must log

                // Unhovered
                event.arrow_id = 0;
                event.start = false;
                event.send();

                hoveredCamera = null;

            }

        }

    };

}

function objectClickerOnClick(camera1, buttonManager, recommendations, coins) {

    return function(obj, x, y) {

        var event;

        // Do stuff for click
        if (obj instanceof Coin) {

            obj.get();

            // Send event to DB
            event = new L3D.BD.Event.CoinClicked();
            event.coin_id = coins.indexOf(obj);
            event.send();

        } else if (obj instanceof L3D.BaseRecommendation) {

            obj.check();
            camera1.moveHermite(obj);

            // Send event to DB
            event = new L3D.BD.Event.ArrowClicked();
            event.arrow_id = recommendations.indexOf(obj);
            event.send();
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

    var width = container_size.width(), height = container_size.height();

    for (var i = 0; i < arguments.length; i++) {

        var obj = arguments[i];

        if (obj instanceof Element) {

            obj.style.width = width + 'px';
            obj.style.height = height + 'px';
            continue;
        }

        if (obj instanceof THREE.WebGLRenderer) {

            obj.setSize(width, height);

        }

        if (obj.domElement) {

            obj.domElement.width = width;
            obj.domElement.height = height;
            continue;

        }

    }

}

function appendTo(container) {

    return function() {

        for (var i = 0; i < arguments.length; i++) {

            container.appendChild(arguments[i].domElement);

        }

    };

}