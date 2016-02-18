ifeq ($(OS),Windows_NT)
	include ./make/utils/define-windows-cmd.mk
else
	include ./make/utils/define-linux-cmd.mk
endif

NPM=npm
TSC=tsc
TSD=tsd
WEBPACK=webpack

CD=cd
