include ./make/utils/define-cmd.mk

all: server bouncing-cube

./node_modules/.dirstamp:
	npm install typescript@next ts-loader webpack
	$(TOUCH) $@

prepare: ./node_modules/.dirstamp

include ./make/makefiles/*.mk
