DEMO_DEPENDENCY=src/demo/build/.dirstamp
demo: $(DEMO_DEPENDENCY)

src/demo/typings/typings/.dirstamp: src/demo/typings/typings.json
	@$(ECHO) $(STYLE_PREPARE)Installing typings of "demo"$(COLOR_DEFAULT)
	@$(CD) src/demo/typings/ && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/demo/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	@$(ECHO) $(STYLE_PREPARE)Installing custom typings of "demo"$(COLOR_DEFAULT)
	@$(MKDIRP) src/demo/typings/custom
	@$(MERGE) ./custom_typings src/demo/typings/custom
	@$(TOUCH_DIRSTAMP)

src/demo/typings/.dirstamp: src/demo/typings/typings/.dirstamp src/demo/typings/custom/.dirstamp
	@$(TOUCH_DIRSTAMP)

src/demo/node_modules/.dirstamp: src/demo/package.json $(L3D_DEPENDENCY) $(L3DP_DEPENDENCY)
	@$(ECHO) $(STYLE_PREPARE)Installing dependencies of "demo"$(COLOR_DEFAULT)
	@$(CD) src/demo/ && $(NPM_UNINSTALL) l3d l3dp && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/server/build/static/js/demo.js: $(wildcard src/demo/*.ts) src/demo/node_modules/.dirstamp src/demo/tsconfig.json src/demo/typings/.dirstamp src/demo/config.js src/server/build/static/js/l3d.js src/server/build/static/js/l3dp.js src/server/build/static/js/config.js src/server/build/static/js/mth.js
	@$(ECHO) $(STYLE_BUILD)Building module "demo"$(COLOR_DEFAULT)
	@$(WEBPACK) --config src/demo/config.js
	@$(TOUCH_DIRSTAMP)
	@$(ECHO) Built module "demo"

clean-demo:
	@$(RMRF) \
		src/demo/node_modules \
		src/demo/build \
		src/demo/typings/typings \
		src/demo/typings/custom \
		src/server/build/static/js/demo.js \
		src/server/build/static/js/demo.js.map
