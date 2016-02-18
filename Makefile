ifeq ($(OS),Windows_NT)
	CP=copy /E /y
	TOUCH=copy /b $@+,,
	MKDIRP=mkdir
else
	CP=cp -r
	TOUCH=touch
	MKDIRP=mkdir -p
endif

NPM=npm
TSC=tsc
WEBPACK=webpack

CD=cd

include makefiles/*
