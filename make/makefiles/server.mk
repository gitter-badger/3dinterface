src/server/typings: src/server/typings/typings/.dirstamp src/server/typings/custom/.dirstamp

src/server/typings/typings/.dirstamp: src/server/typings/typings.json
	$(CD) src/server/typings && $(TYPINGS) install
	$(TOUCH_DIRSTAMP)

src/server/typings/custom/.dirstamp: ./custom_typings/*
	$(MKDIRP) src/server/typings/custom/
	$(MERGE) custom_typings src/server/typings/custom
	$(TOUCH_DIRSTAMP)

src/server/node_modules/.dirstamp: src/server/package.json $(L3D_DEPENDENCY) $(L3DP_DEPENDENCY) $(CONFIG_DEPENDENCY) $(MTH_DEPENDENCY)
	$(CD) src/server/ && $(NPM) install
	$(TOUCH_DIRSTAMP)

src/server/build/.dirstamp: $(shell find src/server/src/ -name "*.ts" -o -name "*.jade") src/server/node_modules/.dirstamp src/server/typings
	$(CD) src/server/ && $(TSC)
	$(TOUCH_DIRSTAMP)

src/server/build/views/.dirstamp: src/server/src/views/*
	$(MKDIRP) src/server/build/views/
	$(MERGE) src/server/src/views src/server/build/views
	$(TOUCH_DIRSTAMP)

src/server/build/static/.dirstamp: src/static/*
	$(MKDIRP) src/server/build/static/
	$(MERGE) src/static/ src/server/build/static/
	$(TOUCH_DIRSTAMP)

src/server/build/controllers/%/views: src/server/src/controllers/%/views
	$(MKDIRP) $@
	$(MERGE) $< $@
	$(TOUCH_DIRSTAMP)

SRC_VIEWS=$(wildcard src/server/src/controllers/*/views)
OBJ_VIEWS=$(subst src/controllers/,build/controllers/,$(SRC_VIEWS))

views: $(OBJ_VIEWS)

src/server/build/static/js/l3d.js: ./src/l3d/build/.dirstamp src/l3d/frontend.config.js
	$(CD) src/l3d/ && $(WEBPACK) --config frontend.config.js

src/server/build/static/js/l3dp.js: ./src/l3dp/build/.dirstamp src/l3dp/frontend.config.js
	$(CD) src/l3dp/ && $(WEBPACK) --config frontend.config.js

src/server/build/static/js/config.js: ./src/config/build/.dirstamp src/config/config.js
	$(CD) src/config/ && $(WEBPACK) --config config.js

src/server/build/static/js/mth.js: ./src/mth/build/.dirstamp src/mth/config.js
	$(CD) src/mth/ && $(WEBPACK) --config config.js

server: src/server/build/.dirstamp src/server/build/views/.dirstamp src/server/build/static/.dirstamp $(OBJ_VIEWS) src/server/build/static/js/l3d.js src/server/build/static/js/l3dp.js src/server/build/static/js/config.js src/server/build/static/js/mth.js

test-server: server
	$(CD) src/server/build/ && $(NODE) server.js --nolisten

run-server: server
	$(CD) src/server/build && $(NODE) server.js
