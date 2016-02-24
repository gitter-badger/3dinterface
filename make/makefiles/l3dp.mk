L3DP_DEPENDENCY=src/l3dp/build/.dirstamp
l3dp: $(L3DP_DEPENDENCY)

src/l3dp/typings: src/l3dp/typings/typings/.dirstamp src/l3dp/typings/custom/.dirstamp

src/l3dp/typings/typings/.dirstamp: src/l3dp/typings/typings.json
	@$(ECHO) $(STYLE_PREPARE)Installing typings of "l3dp"$(COLOR_DEFAULT)
	@$(CD) src/l3dp/typings && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/l3dp/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	@$(ECHO) $(STYLE_PREPARE)Installing custom typings of "l3dp"$(COLOR_DEFAULT)
	@$(MKDIRP) src/l3dp/typings/custom/
	@$(MERGE) custom_typings src/l3dp/typings/custom
	@$(TOUCH_DIRSTAMP)

src/l3dp/node_modules/.dirstamp: src/l3dp/package.json $(L3D_DEPENDENCY) $(CONFIG_DEPENDENCY) $(MTH_COMMONJS_DEPENDENCY)
	@$(ECHO) $(STYLE_PREPARE)Installing dependencies of "l3dp"$(COLOR_DEFAULT)
	@$(CD) src/l3dp/ && $(NPM_UNINSTALL) config l3d mth && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/l3dp/build/.dirstamp: $(wildcard src/l3dp/src/*) src/l3dp/node_modules/.dirstamp src/l3dp/tsconfig-backend.json src/l3dp/backend.config.js src/l3dp/typings
	@$(ECHO) $(STYLE_BUILD)Building module "l3dp"$(COLOR_DEFAULT)
	@$(WEBPACK) --config src/l3dp/backend.config.js
	@$(TOUCH_DIRSTAMP)
	@$(ECHO) Built module "l3dp"

clean-l3dp:
	@$(RMRF) \
		src/l3dp/build \
		src/l3dp/node_modules \
		src/l3dp/typings/typings \
		src/l3dp/typings/custom \
		src/server/build/static/js/l3dp.js \
		src/server/build/static/js/l3dp.js.map
