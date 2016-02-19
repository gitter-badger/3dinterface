include ./make/utils/define-cmd.mk

all: server bouncing-cube

./node_modules/.dirstamp:
	npm install typescript@next ts-loader webpack webpack-fail-plugin
	$(TOUCH_DIRSTAMP)

prepare: ./node_modules/.dirstamp

include ./make/makefiles/*.mk
