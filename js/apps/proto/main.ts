///<reference path="../typings/tsd.d.ts"/>
///<reference path="../typings/polyfills.d.ts"/>
///<reference path="../typings/threejs-examples/three.examples.d.ts"/>
///<reference path="../typings/stats/stats.d.ts"/>

import * as THREE from 'three';
import * as L3D from 'L3D';
import { Stats } from 'stats';

import { Coin } from './scenes/Coin';
import { CoinCanvas } from './scenes/CoinCanvas';
import { SceneWithCoins } from './scenes/SceneWithCoins';
import { ButtonManager } from './scenes/ButtonManager';

import { logfps, appendTo, resizeElements, show, hide, resetCameraAspect } from './functions';

module Proto {

    L3D.DB.disable();

    var GLOB : any;

    // Let's be sure we avoid using global variables
    window.onWindowResize = (function() {

        // L3D.ProgressiveLoader.onFinished = function() {
        //
        //     if (coins.length === 0 || coins[0].mesh === undefined) {
        //         setTimeout(L3D.ProgressiveLoader.onFinished, 500);
        //         return;
        //     }
        //
        //     for (var i = 0; i < coins.length; i++) {
        //         coins[i].mesh.visible = true;
        //     }
        //
        //     // if (GLOB.initMainScene !== L3D.initSponza)
        //     //     loadingCanvas.clear();
        //
        //     L3D.DB.enable();
        //     camera.reset();
        //
        // };

        // Disable scrolling
        window.onscroll = function () { window.scrollTo(0, 0); };

        window.onload = main;

        var stats : Stats,
            renderer : THREE.WebGLRenderer,
            scene : SceneWithCoins,
            container : HTMLElement,
            clickableObjects : THREE.Object3D[] = [],
            recommendations : L3D.BaseRecommendation[],
            objectClicker : L3D.ObjectClicker,
            previewer : L3D.Previewer,
            camera : L3D.PointerCamera,
            coins : Coin[] = [],
            previousTime : number,
            pointer : L3D.MousePointer,
            startCanvas : L3D.StartCanvas,
            loadingCanvas : L3D.LoadingCanvas,
            coinCanvas : CoinCanvas,
            buttonManager : ButtonManager;

        // window.onbeforeunload = function() {
        //
        //     if (initMainScene !== L3D.initPeach && initMainScene !== L3D.initSponza && !($('#next').is(":visible"))) {
        //
        //         return 'Warning : you are going to leave the page and abort the current test !';
        //
        //     }
        //
        // };

        var nextPage = '/prototype/play';

        // Coin.onCoinGot = function(coin) {
        //     coinCanvas.setLevel(Coin.total / Coin.max);

        //     if (coin === 6) {
        //         setTimeout(function() { setNextButton(nextPage, coinCanvas); }, 60*1000);
        //     } else if (coin === 8) {
        //         setNextButton(nextPage, coinCanvas);
        //     }
        // };

        function main() {

            // Main container that holds everything
            container = document.getElementById('container');

            // Initialization
            initThreeElements();
            initCanvases();
            initModels();
            initListeners();

            if (GLOB.hideBeforeLoading === true) {
                appendTo(container)(stats, coinCanvas, startCanvas, pointer, previewer, loadingCanvas, renderer);
                loadingCanvas.render();
            } else
                appendTo(container)(startCanvas, pointer, previewer, renderer);

            // Set the good size of cameras
            onWindowResize();

            coinCanvas.update();


            if (GLOB.locked !== undefined && GLOB.locked)
                startCanvas.render();

            // Some config
            // if (GLOB.initMainScene !== L3D.initPeach && GLOB.initMainScene !== L3D.initSponza)
            //     setInterval(function() {logfps(stats.getFps());}, 500);
            // else
            //     L3D.DB.disable();

            // startCanvas.render(L3D.StartCanvas.Black);

            // Bind previewer to renderer (for fixed option)
            function bind() {
                if (document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement) {
                    // Lock event
                    previewer.fixed = true;
                } else {
                    // Unlock event
                    previewer.fixed = false;
                }
            }
            document.addEventListener('pointerlockchange', bind);
            document.addEventListener('mozpointerlockchange', bind);
            document.addEventListener('webkitpointerlockchange', bind);

            // Start rendering
            setInterval(render, 20);

        }

        function initThreeElements() {

            // Initialize scene
            scene = new GLOB.SceneClass();
            scene.addEventListener('onload', function() { loadingCanvas.clear(); });
            renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
            renderer.setClearColor(0x87ceeb);

            // var loader = new THREE.OBJLoader();

            // loader.load(
            //     '/static/data/coin/Coin.obj',
            //     function(object) {
            //         object.traverse(function (mesh) {
            //             if (mesh instanceof THREE.Mesh) {
            //                 mesh.scale.set(0.01,0.01,0.01);
            //                 mesh.material.color.setHex(0xffff00);
            //                 mesh.geometry.computeVertexNormals();
            //                 mesh.raycastable = true;
            //                 mesh.position.copy(new THREE.Vector3(-23.85237224023958,12.30017484578007,2.883526209796364));
            //                 scene.add(mesh);

            //                 newMesh = mesh.clone();
            //                 newMesh.position.copy(new THREE.Vector3(-8.225753727064939,11.932703941399415,8.637544772060489));
            //                 scene.add(newMesh);

            //                 newMesh.position.copy(new THREE.Vector3(18.198980821370327,2.5219742652442885,10.741621475827422));
            //                 scene.add(newMesh);

            //             }
            //         });
            //     }
            // );

            // Initialize pointer camera
            camera = new L3D.PointerCamera(
                50,
                window.containerSize.width() / window.containerSize.height(),
                0.01, 100000, renderer, container
            );

            // scene.setCamera(camera);

            // scene.load(GLOB.prefetch, GLOB.lowRes);

            // scene.addRecommendations(GLOB.Recommendation);

            // scene.addCoins(GLOB.coinConfig);

            camera.collidableObjects = scene.collidableObjects;
            camera.collisions = true;

            // Get default param for camera lock
            $('#lock').prop('checked', GLOB.locked);
            camera.shouldLock = GLOB.locked;
            camera.onPointerLockChange();

        }

        function initCanvases() {

            // Initialize previewer
            previewer = new L3D.Previewer(renderer, scene);
            previewer.domElement.style.position ="absolute";
            previewer.domElement.style.cssFloat = 'top-left';

            // Initialize stats counter
            stats = new Stats();
            stats.setMode(0);
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.cssFloat = "top-left";

            // Initialize coin counter
            coinCanvas = new CoinCanvas();
            coinCanvas.domElement.style.position = 'absolute';
            coinCanvas.domElement.style.cssFloat = 'top-left';

            // Initialize pointer for pointer lock
            pointer = new L3D.MousePointer(camera);

            // Init start canvas
            startCanvas = new L3D.StartCanvas(camera);

            loadingCanvas = new L3D.LoadingCanvas();
        }

        function initModels() {

            // // Init recommendations
            // recommendations = GLOB.initMainScene(camera, scene, coins, clickableObjects);

            // // init clickable objects
            // var i;
            // for (i = 0; i < coins.length; i++)
            //     clickableObjects.push(coins[i]);

            // for (i =0; i < recommendations.length; i++)
            //     clickableObjects.push(recommendations[i]);

        }

        function initListeners() {

            // Add listeners
            window.addEventListener('resize', onWindowResize, false);

            // HTML Bootstrap buttons
            buttonManager = new ButtonManager(camera, recommendations, previewer);

            // Object clicker for hover and clicking recommendations
            objectClicker = new L3D.ObjectClicker();

        }

        function render() {

            // Stats for render
            stats.begin();

            objectClicker.update();

            // Update recommendations (set raycastable if shown)
            scene.recommendations.map(function(reco : L3D.BaseRecommendation) {
                if (reco instanceof L3D.BaseRecommendation) {
                    reco.traverse(function(elt) {
                        elt.visible = elt.raycastable = buttonManager.showArrows;
                    });
                }
            });

            // Update coins
            scene.coins.forEach(function(coin) { coin.update(); });

            // Update main camera
            var currentTime = Date.now() - previousTime;
            camera.update(isNaN(currentTime) ? 20 : currentTime);
            previousTime = Date.now();

            coinCanvas.update();
            coinCanvas.render();

            // Update the recommendations
            scene.recommendations.map(function(reco : L3D.BaseRecommendation) { reco.update(camera);});

            // Set current position of camera
            camera.look();

            var left = 0, bottom = 0, width = window.containerSize.width(), height = window.containerSize.height();
            renderer.setScissor(left, bottom, width, height);
            renderer.enableScissorTest(true);
            renderer.setViewport(left, bottom, width, height);
            renderer.render(scene, camera);

            // Remove borders of preview
            previewer.clear();

            // Hide arrows in recommendation
            scene.recommendations.map(function(reco : L3D.BaseRecommendation) {
                if (reco instanceof L3D.BaseRecommendation)
                    hide(reco);
            });

            // Update transparent elements
            // THREEx.Transparency.update(camera);

            // Render preview
            previewer.render(window.containerSize.width(), window.containerSize.height());


            // Finish stats
            stats.end();

        }

        function onWindowResize() {

            resizeElements(renderer, container, previewer, coinCanvas, pointer, startCanvas, loadingCanvas);

            scene.recommendations.forEach(function(reco : L3D.BaseRecommendation) {
                resetCameraAspect(reco.camera, window.containerSize.width(), window.containerSize.height());
            });

            render();

        }

        // onWindowResize will be the only global function
        return onWindowResize;

    })();

}
