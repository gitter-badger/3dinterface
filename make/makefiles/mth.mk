MTH_COMMONJS_DEPENDENCY=src/mth/build/.dirstamp
mth: $(MTH_COMMONJS_DEPENDENCY)

src/mth/typings/.dirstamp: src/mth/typings.json
	@$(ECHO) $(STYLE_PREPARE)Installing typings of "mth"$(COLOR_DEFAULT)
	@$(CD) src/mth/ && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/mth/node_modules/.dirstamp: src/mth/package.json
	@$(ECHO) $(STYLE_PREPARE)Installing dependencies of "mth"$(COLOR_DEFAULT)
	@$(CD) src/mth/ && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/mth/build/.dirstamp: $(wildcard src/mth/*.ts) src/mth/package.json src/mth/tsconfig.json src/mth/typings/.dirstamp src/mth/node_modules/.dirstamp $(wildcard src/mth/tests/*.ts)
	@$(ECHO) $(STYLE_BUILD)Building module "mth"$(COLOR_DEFAULT)
	@$(CD) src/mth/ && $(TSC)
	@$(TOUCH_DIRSTAMP)
	@$(ECHO) Built module "mth"

test-mth: $(MTH_COMMONJS_DEPENDENCY)
	@$(NODEUNIT) src/mth/build/tests/main.js

clean-mth:
	@$(RMRF) \
		src/mth/typings \
		src/mth/build \
		src/mth/node_modules \
		src/server/build/static/js/mth.js \
		src/server/build/static/js/mth.js.map
