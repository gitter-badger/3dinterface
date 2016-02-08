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

compile: server

server:
	tsc
	rm -rf ../build/server/views
	cp package.json ../build/server/
	cp -r views ../build/server/views
	mkdir -p ../build/server/geo
	cp -r geo/generated ../build/server/geo/generated
	cp -r geo/*.json ../build/server/geo/
	for path in `ls controllers`; do \
		if [ -d ../build/server/controllers/$$path/ ]; then \
			rm -rf ../build/server/controllers/$$path/views; \
			if [ -d controllers/$$path/views ]; then \
				cp -r controllers/$$path/views ../build/server/controllers/$$path/views; \
			fi \
		fi \
	done
