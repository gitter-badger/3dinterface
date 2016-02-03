OPT=--compilation_level SIMPLE_OPTIMIZATIONS

SIMPLE_COMPILER=../utils/simple-compiler/compiler.sh
CLOSURE_COMPILER=java -jar ../utils/closure-compiler/closure-compiler.jar

ifeq ($(TYPE),RELEASE)
	COMPILER=$(CLOSURE_COMPILER)
else
	COMPILER=$(SIMPLE_COMPILER)
endif

all: compile L3D BouncingCube
	cp build/*.min.js ../static/js/

compile:
	tsc
	cp l3d/src/L3D_Head.js obj/src/L3D_Head.js

L3D: compile
	mkdir -p build/
	$(SIMPLE_COMPILER) $(OPT) \
		--js l3d/src/L3D.ts \
		--js l3d/src/math/Tools.ts \
		--js l3d/src/math/Hermite.ts \
		--js l3d/src/utils/ObjectClicker.ts \
		--js l3d/src/utils/Logger.ts \
		--js l3d/src/utils/History.ts \
		--js l3d/src/canvases/StartCanvas.ts \
		--js l3d/src/canvases/LoadingCanvas.ts \
		--js l3d/src/canvases/MousePointer.ts \
		--js l3d/src/loaders/ProgressiveLoader.ts \
		--js l3d/src/recommendations/BaseRecommendation.ts \
		--js l3d/src/recommendations/ArrowRecommendation.ts \
		--js l3d/src/recommendations/ViewportRecommendation.ts \
		--js l3d/src/cameras/Camera.ts \
		--js l3d/src/cameras/FixedCamera.ts \
		--js l3d/src/cameras/PointerCamera.ts \
		--js l3d/src/cameras/ReplayCamera.ts \
		--js l3d/src/scenes/Scene.ts \
		--js_output_file build/l3d.min.ts
	echo "export = L3D;" >> build/l3d.min.ts
	cat obj/src/L3D_Head.js > build/l3d.min.js
	$(COMPILER) $(OPT) \
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
	cd ../server && npm install ../js

BouncingCube:
	$(COMPILER) $(OPT) \
		--js obj/apps/bouncing-cube/BouncingCube.js \
		--js obj/apps/bouncing-cube/main.js \
		--js_output_file build/bouncing.min.js

clean:
	rm -rf obj/* build/*
