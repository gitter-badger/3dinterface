ifeq ($(OS),Windows_NT)
	MERGE=copy /E /y
	TOUCH=copy /b $@+,,
	MKDIRP=mkdir
else
	MERGE=sh -c 'cp -r $$0/* $$1'
	TOUCH=touch
	MKDIRP=mkdir -p
endif

NPM=npm
TSC=tsc
TSD=tsd
WEBPACK=webpack

CD=cd

all: server bouncing-cube

./node_modules/.dirstamp:
	npm install typescript@next ts-loader webpack
	$(TOUCH) $@

prepare: ./node_modules/.dirstamp

include makefiles/*
