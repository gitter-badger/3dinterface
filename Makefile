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

prepare:
	npm install typescript@next ts-loader webpack

all: server bouncing-cube

include makefiles/*
