all: build

typings: typings/typings/.dirstamp typings/custom/.dirstamp

typings/typings/.dirstamp: typings/tsd.json
	cd typings && tsd install
	touch $@

typings/custom/.dirstamp: ../custom_typings/*
	mkdir -p typings/custom/
	cp -r ../custom_typings/* ./typings/custom
	touch $@

node_modules/.dirstamp: package.json
	npm install
	touch $@

../server/build/static/js/bouncing.min.js: src/* node_modules/.dirstamp tsconfig.json typings
	webpack --config config.js

build: ../server/build/static/js/bouncing.min.js

.PHONY: build all
