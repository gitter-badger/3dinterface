MTH_COMMONJS_DEPENDENCY=src/mth/build/.dirstamp
mth: $(MTH_COMMONJS_DEPENDENCY)

src/mth/typings/.dirstamp: src/mth/typings.json
	@$(call LOG_TYPINGS,mth)
	@$(CD) src/mth/ && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/mth/node_modules/.dirstamp: src/mth/package.json
	@$(call LOG_DEPENDENCIES,mth)
	@$(CD) src/mth/ && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/mth/build/.dirstamp: $(call FIND,src/mth/,*.ts) src/mth/package.json src/mth/tsconfig.json src/mth/typings/.dirstamp src/mth/node_modules/.dirstamp
	@$(call LOG_BUILDING,mth)
	@$(CD) src/mth/ && $(TSC)
	@$(TOUCH_DIRSTAMP)
	@$(call LOG_BUILT,mth)

test-mth: $(MTH_COMMONJS_DEPENDENCY)
	@$(NODEUNIT) src/mth/build/tests/main.js

clean-mth:
	@$(RMRF) \
		src/mth/typings \
		src/mth/build \
		src/mth/node_modules \
		src/server/build/static/js/mth.js \
		src/server/build/static/js/mth.js.map
