ifeq ($(OS),Windows_NT)
	include ./make/utils/define-windows-cmd.mk
else
	include ./make/utils/define-linux-cmd.mk
endif

NODE=node
NPM_INSTALL=npm install
NPM_UNINSTALL=npm uninstall
TSC=tsc
TYPINGS=typings
WEBPACK=webpack
NODEUNIT=nodeunit

CD=cd
