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

L3D: compile
	$(CLOSURE) $(OPT) \
		--js obj/src/L3D.js \
		--js obj/src/cameras/Camera.js \
		--js obj/src/cameras/PointerCamera.js \
		--js_output_file build/l3d.min.js

BouncingCube:
	$(CLOSURE) $(OPT) \
		--js obj/apps/bouncing-cube/BouncingCube.js \
		--js obj/apps/bouncing-cube/main.js \
		--js_output_file build/bouncing.min.js

clean:
	rm -rf obj/* build/*
