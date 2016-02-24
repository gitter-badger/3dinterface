ifeq ($(OS),Windows_NT)
	include ./make/utils/define-windows-cmd.mk
else
	include ./make/utils/define-linux-cmd.mk
endif

NODE=node>$(DEVNULL)
NPM_INSTALL=npm install --loglevel error --progress false>$(DEVNULL)
NPM_UNINSTALL=npm uninstall --loglevel error --progress false>$(DEVNULL)
TSC=tsc>$(DEVNULL)
TYPINGS=typings>$(DEVNULL)
WEBPACK=webpack>$(DEVNULL)
NODEUNIT=nodeunit>$(DEVNULL)
TO_NULL=> (DEVNULL)
CD=cd
