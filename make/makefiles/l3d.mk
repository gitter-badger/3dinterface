L3D_DEPENDENCY=src/l3d/build/.dirstamp
l3d: $(L3D_DEPENDENCY)

src/l3d/typings: src/l3d/typings/typings/.dirstamp src/l3d/typings/custom/.dirstamp

src/l3d/typings/typings/.dirstamp: src/l3d/typings/typings.json
	@$(ECHO) $(STYLE_PREPARE)Installing typings of "l3d"$(COLOR_DEFAULT)
	@$(CD) src/l3d/typings && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/l3d/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	@$(ECHO) $(STYLE_PREPARE)Install custom typings of "l3d"$(COLOR_DEFAULT)
	@$(MKDIRP) src/l3d/typings/custom/
	@$(MERGE) ./custom_typings src/l3d/typings/custom
	@$(TOUCH_DIRSTAMP)

src/l3d/node_modules/.dirstamp: src/l3d/package.json $(MTH_COMMONJS_DEPENDENCY)
	@$(ECHO) $(STYLE_PREPARE)Installing dependencies of "l3d"$(COLOR_DEFAULT)
	@$(CD) src/l3d/ && $(NPM_UNINSTALL) mth && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/l3d/build/.dirstamp: $(wildcard src/l3d/src/*) $(wildcard src/l3d/*/*) src/l3d/node_modules/.dirstamp src/l3d/tsconfig-backend.json src/l3d/backend.config.js src/l3d/typings/typings/.dirstamp src/l3d/typings/custom/.dirstamp
	@$(ECHO) $(STYLE_BUILD)Building module "l3d"$(COLOR_DEFAULT)
	@$(WEBPACK) --config src/l3d/backend.config.js
	@$(TOUCH_DIRSTAMP)
	@$(ECHO) Built module "l3d"

clean-l3d:
	@$(RMRF) \
		src/l3d/build \
		src/l3d/node_modules \
		src/l3d/typings/typings \
		src/l3d/typings/custom \
		src/server/build/static/js/l3d.js \
		src/server/build/static/js/l3d.js.map
