var mesh_number = 25;
var renderer, scene, controls, cube, container, plane, mouse= {x:0, y:0};
var bigmesh;
var raycaster;
var objects = [];
var cameras = new CameraContainer();
var spheres = new Array(mesh_number);
var visible = 0;
var stats;
var canvas;
var ctx2d;

var loader;

var container_size = {width: 1024, height: 576};
var prev = {x:0, y:0, go:false};
var showArrows = true;
var beenFullscreen = false;

init();
animate();

function init() {
    // Collidable objects to prevent camera from traversing objects
    var collidableObjects = new Array();

    document.getElementById('full').onclick = fullscreen;

    // Add the listener on the button
    document.getElementById('reset').onclick = function() { cameras.mainCamera().reset(); };
    var fullarrow = document.getElementById('fullarrow');
    fullarrow.onchange = function() {
        cameras.map(function(camera) {
            if (camera instanceof FixedCamera) {
                camera.fullArrow = fullarrow.checked;
            }
        });
    }

    var collisions = document.getElementById('collisions');
    collisions.onchange = function() {
        cameras.mainCamera().collisions = collisions.checked;
    }

    var showarrows = document.getElementById('showarrows');
    showarrows.onchange = function() {
        showArrows = showarrows.checked;
    }

    // on initialise le moteur de rendu
    container = document.getElementById('container');
    container.style.height = container_size.height + 'px';
    container.style.width = container_size.width + 'px';
    renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setSize(container_size.width, container_size.height);
    renderer.shadowMapEnabled = true;
    renderer.setClearColor(0x87ceeb);
    renderer.sortObjects = false;

    canvas = document.createElement('canvas');
    canvas.style.position ="absolute";
    canvas.style.cssFloat = 'top-left';
    canvas.width = container_size.width;
    canvas.height = container_size.height;
    ctx2d = canvas.getContext('2d');
    ctx2d.lineWidth = 1;

    // on initialise la scène
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();

    // Create stats counter
    stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.cssFloat = "top-left";
    container.appendChild( stats.domElement );
    container.appendChild(canvas);
    container.appendChild(renderer.domElement);

    // init light
    var directional_light = new THREE.DirectionalLight(0xdddddd);
    directional_light.position.set(1, 0.5, 1).normalize();
    directional_light.castShadow = false;
    scene.add(directional_light);

    var ambient_light = new THREE.AmbientLight(0x444444);
    scene.add(ambient_light);

    // on initialise la camera que l’on place ensuite sur la scène
    var camera1 = new PointerCamera(50, container_size.width / container_size.height, 0.01, 100000, container);
    camera1.speed = 0.001;
    camera1.reset();
    scene.add(camera1);
    cameras.push(camera1);

    var loader = new THREE.OBJMTLLoader();

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    // THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
    var loader = new THREE.OBJMTLLoader();
    loader.load( static_path + 'data/castle/princess peaches castle (outside).obj',
                 static_path + 'data/castle/princess peaches castle (outside).mtl',
    function ( object ) {
        object.up = new THREE.Vector3(0,0,1);
        scene.add(object);
        collidableObjects.push(object);
        object.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.geometry.mergeVertices();
                object.geometry.computeVertexNormals();
                object.material.side = THREE.DoubleSide;
                object.raycastable = true;
                if (object.material.name === 'Material.103_princess_peaches_cast') {
                    object.material.transparent = true;
                }
            }
        });
    }, onProgress, onError );

    loader.load( static_path + 'data/first/Floor 1.obj',
                 static_path + 'data/first/Floor 1.mtl',
    function ( object ) {
        object.position.z -= 10.9;
        object.position.y += 0.555;
        object.position.x += 3.23;

        var theta = 0.27;
        object.rotation.y = Math.PI - theta;

        object.up = new THREE.Vector3(0,0,1);
        scene.add(object);
        collidableObjects.push(object);
        object.traverse(function (object) {
            if (object instanceof THREE.Mesh) {
                object.material.side = THREE.DoubleSide;
                // object.geometry.mergeVertices();
                // object.geometry.computeVertexNormals();
                object.raycastable = true;
                if (object.material.name === 'Material.054_777F0E0B_c.bmp' ||
                    object.material.name === 'Material.061_5C3492AB_c.bmp'   ) {
                    object.material.transparent = true;
                }
            }
        });
    }, onProgress, onError );

    // loader.load( static_path + 'data/bobomb/bobomb battlefeild.obj',
    //              static_path + 'data/bobomb/bobomb battlefeild.mtl',
    //         function ( object ) {
    //             // object.position.z -= 10.9;
    //             // object.position.y += 0.555;
    //             // object.position.x += 3.23;

    //             var theta = 0.27;
    //             object.rotation.y = Math.PI - theta;

    //             object.up = new THREE.Vector3(0,0,1);
    //             collidableObjects.push(object);
    //             scene.add(object);
    //             object.traverse(function (object) {
    //                 if (object instanceof THREE.Mesh) {
    //                     object.material.side = THREE.DoubleSide;
    //                     console.log(object.geometry.vertices.length);
    //                     object.geometry.mergeVertices();
    //                     object.geometry.computeVertexNormals();
    //                 }
    //             });
    //         }, onProgress, onError );

    createCamera(
            new THREE.Vector3(-3.349895207953063, 5.148106346852601, 0.3365943929701533),
            new THREE.Vector3(13.114421714865292, -7.783476327687569, -33.74713248359852)
    );

    createCamera(
            new THREE.Vector3(4.659399030971226, 1.018674883050052597, -2.578139604982815),
            new THREE.Vector3(-16.08800293200113, -28.8795632312717, -19.165379404919797)
    );

    createCamera(
            new THREE.Vector3(2.625389073616235, 1.2252620948239699, -4.818718135555419),
            new THREE.Vector3(-19.756833131355208, -16.20027570329664, -33.02132017177813)
    );

    createCamera(
            new THREE.Vector3(1.3304975149911331, 0.4836093721106701, -8.60618907952783),
            new THREE.Vector3(-1.7713635815431914, 6.271997833695163, -48.06341930106774)
    );

    createCamera(
            new THREE.Vector3(1.2976081760482443, 1.1520399813234647, -10.258148122402845),
            new THREE.Vector3(-26.00651734173549, -9.19681009597505, -37.596510029925945)
    );

    createCamera(
            new THREE.Vector3(0.15727187830660858, 2.7251137440572855, -5.84333603646124),
            new THREE.Vector3(19.33738702531091, -13.614383891308975, -36.91010284556961)
    );

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mousedown', function(event) { if (event.which == 1) click(event); }, false);
    container.addEventListener('mousemove', updateMouse, false);
    document.addEventListener('keydown', function(event) { if (event.keyCode == 27) { stopFullscreen();} }, false);

    camera1.collidableObjects = collidableObjects;

    // Load the scene
    loadScene();


}

function fullscreen() {

    if (!beenFullscreen) {
        beenFullscreen = true;
        alert('To quit fullscren mode, type ESC key');
    }

    container.style.position = "absolute";
    container.style.cssFloat = "top-left";
    container.style.top = "0px";
    container.style.bottom = "0px";
    container.style.left = "0px";
    container.style.right = "0px";
    container.style.width="";
    container.style.height="";
    container.style.overflow = "hidden";

    canvas.style.position = "absolute";
    canvas.style.cssFloat = "top-left";
    canvas.style.top = "0px";
    canvas.style.bottom = "0px";
    canvas.style.left = "0px";
    canvas.style.right = "0px";
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    canvas.style.overflow = "hidden";

    onWindowResize();
}

function stopFullscreen() {
    container.style.position = "";
    container.style.cssFloat = "";
    container.style.width = container_size.width + "px";
    container.style.height = container_size.height + "px";
    container.style.overflow = "";

    // canvas.style.position = "";
    // canvas.style.cssFloat = "";
    canvas.style.top = "";
    canvas.style.bottom = "";
    canvas.style.left = "";
    canvas.style.right = "";
    canvas.width = container_size.width;
    canvas.height = container_size.height;
    // canvas.style.overflow = "";

    onWindowResize();
}

function log() {
    console.log(container.style.width);
}

function createCamera(position, target) {
    var camera = new FixedCamera(
            50,
            container_size.width / container_size.height,
            1,
            100000,
            position,
            target
    );

    camera.addToScene(scene);
    cameras.push(camera);

}

function loadScene() {

}

function render() {
    updateMouse();

    var transform = showArrows ? show : hide;
    cameras.map(function(camera) {
        if (camera instanceof FixedCamera) {
            transform(camera);

            camera.traverse(function(elt) {
                elt.raycastable = showArrows;
            });
        }
    });

    cameras.updateMainCamera();
    cameras.update(cameras.mainCamera());
    cameras.look();

    var left = 0, bottom = 0, width = container.offsetWidth, height = container.offsetHeight;
    renderer.setScissor(left, bottom, width, height);
    renderer.enableScissorTest(true);
    renderer.setViewport(left, bottom, width, height);
    renderer.render(scene, cameras.mainCamera());

    // Clear canvas
    canvas.width = canvas.width;

    width = container.offsetWidth / 5;
    height = container.offsetHeight / 5;
    left = prev.x - width/2;
    bottom =  renderer.domElement.height - prev.y + height/5;

    if (prev.go) {
        // Hide arrows
        cameras.map(function(camera) { if (camera instanceof FixedCamera) hide(camera); });

        width = container.offsetWidth / 5;
        height = container.offsetHeight / 5;
        left = prev.x - width/2;
        bottom =  renderer.domElement.height - prev.y + height/5;


        // Draw border
        var can_bottom = container.offsetHeight - bottom - height ;
        ctx2d.strokeStyle = "#ffffff";
        ctx2d.beginPath();
        ctx2d.moveTo(left-1, can_bottom);
        ctx2d.lineTo(left-1, can_bottom + height);
        ctx2d.lineTo(left + width-1, can_bottom + height);
        ctx2d.lineTo(left + width-1, can_bottom);
        ctx2d.closePath();
        ctx2d.stroke();

        ctx2d.strokeStyle = "#000000";
        ctx2d.beginPath();
        ctx2d.moveTo(left, can_bottom + 1);
        ctx2d.lineTo(left, can_bottom + height - 1);
        ctx2d.lineTo(left + width - 2 , can_bottom + height-1);
        ctx2d.lineTo(left + width - 2, can_bottom+1);
        ctx2d.closePath();
        ctx2d.stroke();

        // Do render in previsualization
        prev.camera.look();
        renderer.setScissor(left, bottom, width, height);
        renderer.enableScissorTest (true);
        renderer.setViewport(left, bottom, width, height);
        renderer.render(scene, prev.camera);
    }
}

function animate() {
    // on appelle la fonction animate() récursivement à chaque frame
    requestAnimationFrame(animate);

    stats.begin();
    render();
    stats.end();
}

function onWindowResize() {
    cameras.forEach(function(camera) {camera.aspect = container.offsetWidth / container.offsetHeight;});
    cameras.forEach(function(camera) {camera.updateProjectionMatrix();});

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    render();
}

function hide(object) {
    object.traverse(function(object) {object.visible = false;});
}

function show(object) {
    object.traverse(function(object) {object.visible = true;});
}

function updateMouse(event) {

    if (event !== undefined) {
        mouse.x = event.offsetX == undefined ? event.layerX : event.offsetX;
        mouse.y = event.offsetY == undefined ? event.layerY : event.offsetY;
    }

    var hovered = pointedCamera(event);

    if (hovered !== undefined) {
        prev.x = mouse.x;
        prev.y = mouse.y;
        prev.camera = hovered;
        prev.go = true;
    } else {
        prev.go = false;
    }
}

function click(event) {
    var newCamera = pointedCamera(event);
    if (newCamera !== undefined)
        cameras.mainCamera().move(newCamera);
}

function pointedCamera(event) {
    var returnCamera;

    var x = ( mouse.x / renderer.domElement.width ) * 2 - 1;
    var y = - (mouse.y / renderer.domElement.height) * 2 + 1;

    var camera = cameras.mainCamera();

    var vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera);

    raycaster.set(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(scene.children, true);

    if ( intersects.length > 0 ) {
        var minDistance;
        var bestIndex;

        // Looking for cameras
        for (i in intersects) {
            if (intersects[i].object.raycastable) {
                if ((intersects[i].distance > 0.5 && minDistance === undefined) || (intersects[i].distance < minDistance )) {
                    if (!(intersects[i].object instanceof THREE.Mesh && intersects[i].object.material.opacity < 0.1)) {
                        minDistance = intersects[i].distance;
                        bestIndex = i;
                    }
                }
            }
        }

        if (bestIndex !== undefined) {
            if (cameras.getById(intersects[bestIndex].object.parent.id) !== undefined) {
                return cameras.getById(intersects[bestIndex].object.parent.id);
            }
        }
    }
}
