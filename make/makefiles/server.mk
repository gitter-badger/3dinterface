src/server/typings: src/server/typings/typings/.dirstamp src/server/typings/custom/.dirstamp

src/server/typings/typings/.dirstamp: src/server/typings/tsd.json
	$(CD) src/server/typings && $(TSD) install
	$(TOUCH_DIRSTAMP)

src/server/typings/custom/.dirstamp: ./custom_typings/*
	$(MKDIRP) src/server/typings/custom/
	$(MERGE) custom_typings src/server/typings/custom
	$(TOUCH_DIRSTAMP)

src/server/node_modules/.dirstamp: src/server/package.json l3d l3dp config
	$(CD) server && $(NPM) install
	$(TOUCH_DIRSTAMP)

src/server/build/.dirstamp: src/server/src/* src/server/node_modules/.dirstamp src/server/typings
	$(CD) server && $(TSC)
	$(TOUCH_DIRSTAMP)

src/server/build/views/.dirstamp: src/server/src/views/*
	$(MKDIRP) src/server/build/views/
	$(MERGE) src/server/src/views src/server/build/views
	$(TOUCH_DIRSTAMP)

src/server/build/src/static/.dirstamp: src/static/*
	$(MKDIRP) src/server/build/src/static/
	$(MERGE) static src/server/build/src/static/
	$(TOUCH_DIRSTAMP)

src/server/build/controllers/%/views: src/server/src/controllers/%/views
	$(MKDIRP) $@
	$(MERGE) $< $@
	$(TOUCH_DIRSTAMP)

SRC_VIEWS=$(wildcard src/server/src/controllers/*/views)
OBJ_VIEWS=$(subst src,build,$(SRC_VIEWS))

views: $(OBJ_VIEWS)

src/server/build/src/static/js/l3d.js: ./src/l3d/build/.dirstamp
	$(CD) ./l3d && $(WEBPACK) --config frontend.config.js

src/server/build/src/static/js/l3dp.js: ./src/l3dp/build/.dirstamp
	$(CD) ./l3dp && $(WEBPACK) --config frontend.config.js

src/server/build/src/static/js/config.js: ./src/config/build/.dirstamp
	$(CD) ./config && $(TSC)

server: src/server/build/.dirstamp src/server/build/views/.dirstamp src/server/build/src/static/.dirstamp views src/server/build/src/static/js/l3d.js src/server/build/src/static/js/l3dp.js src/server/build/src/static/js/config.js
