OPT=--compilation_level SIMPLE_OPTIMIZATIONS

ifeq ($(TYPE),RELEASE)
	CLOSURE=java -jar ../utils/closure-compiler/closure-compiler.jar
else
	CLOSURE=../utils/simple-compiler/compiler.sh
endif

all: L3D L3DP Socket Three Stats Bouncing Multisphere StreamingSimulator PrototypeReplay PrototypeInteractive Tutorial

L3D:
	$(CLOSURE) $(OPT) \
		--js l3d/src/l3d.js \
		--js l3d/src/math/Tools.js \
		--js l3d/src/math/Hermite.js \
		--js l3d/src/utils/CameraSelecter.js \
		--js l3d/src/utils/Logger.js \
		--js l3d/src/utils/Objects.js \
		--js l3d/src/utils/History.js \
		--js l3d/src/canvases/StartCanvas.js \
		--js l3d/src/canvases/MousePointer.js \
		--js l3d/src/canvases/Previewer.js \
		--js l3d/src/loaders/ProgressiveLoaderGeometry.js \
		--js l3d/src/loaders/ProgressiveLoader.js \
		--js l3d/src/recommendations/OldFixedCamera.js \
		--js l3d/src/recommendations/ArrowCamera.js \
		--js l3d/src/recommendations/FixedCamera.js \
		--js l3d/src/recommendations/ReverseCamera.js \
		--js l3d/src/cameras/ReplayCamera.js \
		--js l3d/src/cameras/Camera.js \
		--js l3d/src/cameras/PointerCamera.js \
		--js l3d/src/cameras/CameraContainer.js \
		--js l3d/src/scenes/initScene.js \
		--js_output_file ../static/js/l3d.min.js

L3DP:
	$(CLOSURE) $(OPT) \
		--js l3d/apps/prototype/ButtonManager.js \
		--js l3d/apps/prototype/Coin.js \
		--js_output_file ../static/js/l3dp.min.js

Socket:
	cp socket.io/socket.io.min.js ../static/js

Three:
	cp three/three.min.js ../static/js/
	$(CLOSURE) $(OPT) \
		--js three/DDSLoader.js \
		--js three/MTLLoader.js \
		--js three/OBJMTLLoader.js \
		--js three/OBJLoader.js \
		--js three/OrbitControls.js \
		--js three/threex.transparency.js >> ../static/js/three.min.js

Stats:
	cp three/stats.min.js ../static/js/

Bouncing:
	$(CLOSURE) $(OPT) \
		--js l3d/apps/bouncing-cube/BouncingCube.js \
		--js l3d/apps/bouncing-cube/main.js \
		--js_output_file ../static/js/bouncing.min.js

Multisphere:
	$(CLOSURE) $(OPT) \
		--js l3d/apps/multisphere/main.js \
		--js_output_file ../static/js/multisphere.min.js

StreamingSimulator:
	$(CLOSURE) $(OPT) \
		--js l3d/apps/stream-demo/main.js \
		--js_output_file ../static/js/streamingsimulator.min.js

PrototypeInteractive:
	$(CLOSURE) $(OPT) \
		--js l3d/apps/prototype/interactive/main.js \
		--js_output_file ../static/js/prototypeinteractive.min.js

PrototypeReplay:
	$(CLOSURE) $(OPT) \
		--js l3d/apps/prototype/ButtonManager.js \
		--js l3d/apps/prototype/Coin.js \
		--js l3d/apps/prototype/replay/main.js \
		--js_output_file ../static/js/replay.min.js

Tutorial:
	$(CLOSURE) $(OPT) \
		--js l3d/apps/prototype/ButtonManager.js \
		--js l3d/apps/prototype/Coin.js \
		--js l3d/apps/prototype/tutorial/TutoCamera.js \
		--js l3d/apps/prototype/tutorial/TutorialSteps.js \
		--js l3d/apps/prototype/tutorial/main.js \
		--js_output_file ../static/js/tutorial.min.js

clean:
	rm -rf ../static/js/*
