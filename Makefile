ifeq ($(OS),Windows_NT)
	MERGE=copy /E /y
	TOUCH=copy /b $@+,,
	MKDIRP=mkdir
else
	MERGE=sh -c 'cp $$0/* $$1'
	TOUCH=touch
	MKDIRP=mkdir -p
endif

NPM=npm
TSC=tsc
WEBPACK=webpack

CD=cd

all: server bouncing-cube

include makefiles/*
