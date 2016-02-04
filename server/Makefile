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
	rm -rf ../server-bin/views
	cp package.json ../server-bin/
	cp -r views ../server-bin/views
	mkdir -p ../server-bin/geo
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
