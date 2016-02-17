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

build/.dirstamp: src/* node_modules/.dirstamp tsconfig-backend.json backend.config.js
	webpack --config backend.config.js
	touch $@

build: build/.dirstamp

.PHONY: build all
