OPT=--compilation_level SIMPLE_OPTIMIZATIONS

ifeq ($(TYPE),RELEASE)
	CLOSURE=java -jar /usr/share/java/closure-compiler/closure-compiler.jar
else
	CLOSURE=./compiler.sh
endif

all: List ListTest Socket Three Stats ThreeTools Bouncing Multisphere StreamingSimulator PrototypeTools PrototypeReplay PrototypeInteractive Tutorial

Socket:
	cp socket.io/socket.io.min.js ../static/js
	$(CLOSURE) $(OPT) \
		--js ProgressiveLoaderGeometry.js \
		--js ProgressiveLoader.js >> ../static/js/socket.io.min.js

List:
	$(CLOSURE) $(OPT) \
		--js List.js \
		--js_output_file ../static/js/List.min.js

ListTest:
	$(CLOSURE) $(OPT) \
		--js ListTest.js \
		--js_output_file ../static/js/ListTest.min.js


Three:
	cp three/three.min.js ../static/js/
	$(CLOSURE) $(OPT) \
		--js three/threex.transparency.js >> ../static/js/three.min.js

Stats:
	cp three/stats.min.js ../static/js/

ThreeTools:
	$(CLOSURE) $(OPT) \
		--js three/DDSLoader.js \
		--js three/MTLLoader.js \
		--js three/OBJMTLLoader.js \
		--js three/OBJLoader.js \
		--js three/OrbitControls.js \
		--js Tools.js \
		--js_output_file ../static/js/threetools.min.js

Bouncing:
	$(CLOSURE) $(OPT) \
		--js Camera.js \
		--js Cube.js \
		--js BouncingCube.js \
		--js bouncing/BouncingMain.js \
		--js_output_file ../static/js/bouncing.min.js

Multisphere:
	$(CLOSURE) $(OPT) \
		--js Camera.js \
		--js Cube.js \
		--js multisphere/MultiSphere.js \
		--js_output_file ../static/js/multisphere.min.js

StreamingSimulator:
	$(CLOSURE) $(OPT) \
		--js Camera.js \
		--js Cube.js \
		--js ProgressiveSphere.js \
		--js stream/main.js \
		--js_output_file ../static/js/streamingsimulator.min.js

PrototypeTools:
	$(CLOSURE) $(OPT) \
		--js History.js \
		--js StartCanvas.js \
		--js Hermite.js \
		--js Camera.js \
		--js PointerCamera.js \
		--js CameraContainer.js \
		--js MousePointer.js \
		--js prototype/ArrowCamera.js \
		--js prototype/FixedCamera.js \
		--js prototype/OldFixedCamera.js \
		--js prototype/ReverseCamera.js \
		--js prototype/ReplayCamera.js \
		--js prototype/initScene.js \
		--js prototype/raycasterTools.js \
		--js prototype/Previewer.js \
		--js prototype/ButtonManager.js \
		--js prototype/Coin.js \
		--js Logger.js \
		--js_output_file ../static/js/prototypetools.min.js

PrototypeInteractive:
	$(CLOSURE) $(OPT) \
		--js prototype/main.js \
		--js_output_file ../static/js/prototypeinteractive.min.js

PrototypeReplay:
	$(CLOSURE) $(OPT) \
		--js prototype/replay.js \
		--js_output_file ../static/js/replay.min.js

Tutorial:
	$(CLOSURE) $(OPT) \
		--js TutoCamera.js \
		--js prototype/TutorialSteps.js \
		--js prototype/tutorial.js \
		--js_output_file ../static/js/tutorial.min.js

clean:
	rm -rf ../static/js/*
