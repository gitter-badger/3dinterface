OPT=--compilation_level SIMPLE_OPTIMIZATIONS

ifeq ($(TYPE),RELEASE)
	CLOSURE=java -jar ../../utils/closure-compiler/closure-compiler.jar
else
	CLOSURE=../../utils/simple-compiler/compiler.sh
endif

all: Geo

Geo:
	$(CLOSURE) $(OPT) \
		--js Geo.js \
		--js ConfigGenerators/ConfigGenerator.js \
		--js ConfigGenerators/NV_PN.js \
		--js ConfigGenerators/V_PP.js \
		--js ConfigGenerators/V_PD.js \
		--js ConfigGenerators/V_PP_PD.js \
		--js ConfigGenerators/ConfigGeneratorEnd.js \
		--js Mesh.js \
		--js MeshContainer.js \
		--js MeshStreamer.js \
		--js_output_file ../lib/geo.min.js
