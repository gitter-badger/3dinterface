OPT=--compilation_level SIMPLE_OPTIMIZATIONS

ifeq ($(TYPE),RELEASE)
	CLOSURE=java -jar ../utils/closure-compiler/closure-compiler.jar
else
	CLOSURE=../utils/simple-compiler/compiler.sh
endif

all: compile

prepare:
	tsd install
	npm install

compile: server geo-bin

geo-bin:
	$(CLOSURE) $(OPT) \
		--js ../server-bin/geo/Transformation.js \
		--js ../server-bin/geo/Vertex.js \
		--js ../server-bin/geo/Face.js \
		--js ../server-bin/geo/Normal.js \
		--js ../server-bin/geo/TexCoord.js \
		--js ../server-bin/geo/Material.js \
		--js ../server-bin/geo/Mesh.js \
		--js ../server-bin/geo/MeshContainer.js \
		--js ../server-bin/geo/MeshesInfo.js \
		--js ../server-bin/geo/loadMeshes.js \
		--js ../server-bin/geo/ConfigGenerators/ConfigGenerator.js \
		--js ../server-bin/geo/ConfigGenerators/NV_PN.js \
		--js ../server-bin/geo/ConfigGenerators/V_PD.js \
		--js ../server-bin/geo/ConfigGenerators/V_PP.js \
		--js ../server-bin/geo/ConfigGenerators/V_PP_PD.js \
		--js_output_file ../server-bin/lib/geo.min.js

server:
	tsc
	rm -rf ../server-bin/views
	cp -r views ../server-bin/views
	cp -r geo/generated ../server-bin/geo/generated
	cp -r geo/*.json ../server-bin/geo/
	for path in `ls controllers`; do \
		if [ -d ../server-bin/controllers/$$path/ ]; then \
			rm -rf ../server-bin/controllers/$$path/views; \
			if [ -d controllers/$$path/views ]; then \
				cp -r controllers/$$path/views ../server-bin/controllers/$$path/views; \
			fi \
		fi \
	done
