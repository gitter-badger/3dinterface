src/server/typings: src/server/typings/typings/.dirstamp src/server/typings/custom/.dirstamp

src/server/typings/typings/.dirstamp: src/server/typings/typings.json
	@$(ECHO) $(STYLE_PREPARE)Installing typings of "server"$(COLOR_DEFAULT)
	@$(CD) src/server/typings && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/server/typings/custom/.dirstamp: ./custom_typings/*
	@$(ECHO) $(STYLE_PREPARE)Install custom typings of "server"$(COLOR_DEFAULT)
	@$(MKDIRP) src/server/typings/custom/
	@$(MERGE) custom_typings src/server/typings/custom
	@$(TOUCH_DIRSTAMP)

src/server/node_modules/.dirstamp: src/server/package.json $(L3D_DEPENDENCY) $(L3DP_DEPENDENCY) $(CONFIG_DEPENDENCY) $(MTH_DEPENDENCY)
	@$(ECHO) $(STYLE_PREPARE)Installing dependencies of "server"$(COLOR_DEFAULT)
	@$(CD) src/server/ && $(NPM_UNINSTALL) l3d l3dp config mth && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/server/build/.dirstamp: $(shell find src/server/src/ -name "*.ts" -o -name "*.jade") src/server/node_modules/.dirstamp src/server/typings
	@$(ECHO) $(STYLE_BUILD)Building module "server"$(COLOR_DEFAULT)
	@$(CD) src/server/ && $(TSC)
	@$(TOUCH_DIRSTAMP)
	@$(ECHO) Built module "server"

src/server/build/views/.dirstamp: src/server/src/views/*
	@$(ECHO) $(STYLE_PREPARE)Installing views of "server"$(COLOR_DEFAULT)
	@$(MKDIRP) src/server/build/views/
	@$(MERGE) src/server/src/views src/server/build/views
	@$(TOUCH_DIRSTAMP)

src/server/build/static/.dirstamp: src/static/*
	@$(ECHO) $(STYLE_PREPARE)Installing static files of "server"$(COLOR_DEFAULT)
	@$(MKDIRP) src/server/build/static/
	@$(MERGE) src/static/ src/server/build/static/
	@$(TOUCH_DIRSTAMP)

src/server/build/controllers/%/views: src/server/src/controllers/%/views
	@$(MKDIRP) $@
	@$(MERGE) $< $@
	@$(TOUCH_DIRSTAMP)

SRC_VIEWS=$(wildcard src/server/src/controllers/*/views)
OBJ_VIEWS=$(subst src/controllers/,build/controllers/,$(SRC_VIEWS))

views: $(OBJ_VIEWS)

src/server/build/static/js/l3d.js: ./src/l3d/build/.dirstamp src/l3d/frontend.config.js
	@$(CD) src/l3d/ && $(WEBPACK) --config frontend.config.js

src/server/build/static/js/l3dp.js: ./src/l3dp/build/.dirstamp src/l3dp/frontend.config.js
	@$(CD) src/l3dp/ && $(WEBPACK) --config frontend.config.js

src/server/build/static/js/config.js: ./src/config/build/.dirstamp src/config/config.js
	@$(CD) src/config/ && $(WEBPACK) --config config.js

src/server/build/static/js/mth.js: ./src/mth/build/.dirstamp src/mth/config.js
	@$(CD) src/mth/ && $(WEBPACK) --config config.js

server: src/server/build/.dirstamp src/server/build/views/.dirstamp src/server/build/static/.dirstamp $(OBJ_VIEWS) src/server/build/static/js/l3d.js src/server/build/static/js/l3dp.js src/server/build/static/js/config.js src/server/build/static/js/mth.js src/server/build/static/js/demo.js

test-server: server
	@$(CD) src/server/build/ && $(NODE) server.js --nolisten

run-server: server
	@$(CD) src/server/build && $(NODE) server.js

clean-server:
	@$(RMRF) \
		src/server/build
