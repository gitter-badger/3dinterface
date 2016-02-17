all: build

typings: typings/typings/.dirstamp typings/custom/.dirstamp

typings/typings/.dirstamp: typings/tsd.json
	cd typings && tsd install
	touch $@

typings/custom/.dirstamp: ../custom_typings/*
	mkdir -p typings/custom/
	cp -r ../custom_typings/* ./typings/custom
	touch $@

node_modules/.dirstamp: package.json ../l3d ../l3dp ../config
	npm install
	touch $@

build/.dirstamp: src/* node_modules/.dirstamp
	tsc
	touch $@

build/views/.dirstamp: src/views/*
	mkdir -p build/views/
	cp -r src/views build/views
	touch $@

build/static/.dirstamp: ../static/*
	mkdirp build/static/
	cp -r ../static/* build/static/
	touch $@

build/controllers/%/views: src/controllers/%/views
	cp -r $< $@
	touch $@


build: build/.dirstamp build/views/.dirstamp build/static/.dirstamp views

views: $(shell find src/controllers -name "views" | sed 's/src/build/g')

.PHONY: build all views
