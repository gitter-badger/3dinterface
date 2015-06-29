OPT=--compilation_level SIMPLE_OPTIMIZATIONS

ifeq ($(TYPE),RELEASE)
	CLOSURE=java -jar /usr/share/java/closure-compiler/closure-compiler.jar
else
	CLOSURE=../utils/compiler.sh
endif

all: Geo

Geo:
	$(CLOSURE) $(OPT) \
		--js Geo.js \
		--js Mesh.js \
		--js MeshContainer.js \
		--js MeshStreamer.js \
		--js_output_file ../lib/geo.min.js
