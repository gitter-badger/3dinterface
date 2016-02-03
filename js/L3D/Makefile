OPT=--compilation_level SIMPLE_OPTIMIZATIONS

SIMPLE_COMPILER=../../utils/simple-compiler/compiler.sh
CLOSURE_COMPILER=java -jar ../../utils/closure-compiler/closure-compiler.jar

ifeq ($(TYPE),RELEASE)
	COMPILER=$(CLOSURE_COMPILER)
else
	COMPILER=$(SIMPLE_COMPILER)
endif

all: compile L3D
	cp -r build/* ../../static/js/

compile:
	tsc
	# mkdir -p obj/src
	# cp L3D/src/L3D_Head.js obj/src/L3D_Head.js

L3D: compile
	cd ../../server && npm install ../js/L3D
	# cd ../../server && mkdir -p typings/L3D
	# cp -r build/L3D.d.ts ../../server/typings/L3D



BouncingCube:
	$(COMPILER) $(OPT) \
		--js obj/apps/bouncing-cube/BouncingCube.js \
		--js obj/apps/bouncing-cube/main.js \
		--js_output_file build/bouncing.min.js

clean:
	rm -rf obj/* build/*
