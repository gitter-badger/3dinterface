src/bouncing-cube/typings: src/bouncing-cube/typings/typings/.dirstamp src/bouncing-cube/typings/custom/.dirstamp

src/bouncing-cube/typings/typings/.dirstamp: src/bouncing-cube/typings/typings.json
	@$(ECHO) $(STYLE_PREPARE)Installing typings of "bouncing-cube"$(COLOR_DEFAULT)
	@$(CD) src/bouncing-cube/typings && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/bouncing-cube/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	@$(ECHO) $(STYLE_PREPARE)Installing custom typings of "bouncing-cube"$(COLOR_DEFAULT)
	@$(MKDIRP) src/bouncing-cube/typings/custom/
	@$(MERGE) custom_typings src/bouncing-cube/typings/custom
	@$(TOUCH_DIRSTAMP)

src/bouncing-cube/node_modules/.dirstamp: src/bouncing-cube/package.json $(L3D_DEPENDENCY)
	@$(ECHO) $(STYLE_PREPARE)Installing dependencies of "bouncing-cube"$(COLOR_DEFAULT)
	@$(CD) src/bouncing-cube/ && $(NPM_UNINSTALL) l3d && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/server/build/static/js/bouncing.min.js: $(wildcard src/bouncing-cube/src/*) src/bouncing-cube/node_modules/.dirstamp src/bouncing-cube/tsconfig.json src/bouncing-cube/typings
	@$(ECHO) $(STYLE_BUILD)Building module "bouncing-cube"$(COLOR_DEFAULT)
	@$(WEBPACK) --config src/bouncing-cube/config.js
	@$(ECHO) Built module "bouncing-cube"

BOUNCING_CUBE_DEPENDENCY=src/server/build/static/js/bouncing.min.js
bouncing-cube: $(BOUNCING_CUBE_DEPENDENCY)

clean-bouncing-cube:
	@$(RMRF) \
		src/bouncing-cube/build \
		src/bouncing-cube/node_modules \
		src/bouncing-cube/typings/custom \
		src/bouncing-cube/typings/typings \
		src/server/build/static/js/bouncing.min.js \
		src/server/build/static/js/bouncing.min.js.map
