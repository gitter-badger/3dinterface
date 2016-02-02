OPT=--compilation_level SIMPLE_OPTIMIZATIONS

ifeq ($(TYPE),RELEASE)
	CLOSURE=java -jar ../utils/closure-compiler/closure-compiler.jar
else
	CLOSURE=../utils/simple-compiler/compiler.sh
endif

all: compile L3D BouncingCube
	cp build/*.min.js ../static/js/

compile:
	tsc
	cp l3d/src/L3D_Head.js obj/src/L3D_Head.js

L3D: compile
	mkdir -p build/
	cat obj/src/L3D_Head.js > build/l3d.min.js
	$(CLOSURE) $(OPT) \
		--js obj/src/L3D.js \
		--js obj/src/math/Tools.js \
		--js obj/src/math/Hermite.js \
		--js obj/src/utils/ObjectClicker.js \
		--js obj/src/utils/Logger.js \
		--js obj/src/utils/History.js \
		--js obj/src/canvases/StartCanvas.js \
		--js obj/src/canvases/LoadingCanvas.js \
		--js obj/src/canvases/MousePointer.js \
		--js obj/src/loaders/ProgressiveLoader.js \
		--js obj/src/recommendations/BaseRecommendation.js \
		--js obj/src/recommendations/ArrowRecommendation.js \
		--js obj/src/recommendations/ViewportRecommendation.js \
		--js obj/src/cameras/Camera.js \
		--js obj/src/cameras/FixedCamera.js \
		--js obj/src/cameras/PointerCamera.js \
		--js obj/src/cameras/ReplayCamera.js \
		--js obj/src/scenes/Scene.js \
		>> build/l3d.min.js
	mkdir -p ../node_modules/l3d
	cp build/l3d.min.js ../node_modules/l3d/l3d.min.js
	cd .. && npm install js

BouncingCube:
	$(CLOSURE) $(OPT) \
		--js obj/apps/bouncing-cube/BouncingCube.js \
		--js obj/apps/bouncing-cube/main.js \
		--js_output_file build/bouncing.min.js

clean:
	rm -rf obj/* build/*
