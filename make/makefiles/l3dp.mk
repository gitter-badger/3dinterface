L3DP_DEPENDENCY=src/l3dp/build/.dirstamp
l3dp: $(L3DP_DEPENDENCY)

src/l3dp/typings: src/l3dp/typings/typings/.dirstamp src/l3dp/typings/custom/.dirstamp

src/l3dp/typings/typings/.dirstamp: src/l3dp/typings/typings.json
	@$(call LOG_TYPINGS,l3dp)
	@$(CD) src/l3dp/typings && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/l3dp/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	@$(call LOG_CUSTOM,l3dp)
	@$(MKDIRP) src/l3dp/typings/custom/
	@$(MERGE) custom_typings src/l3dp/typings/custom
	@$(TOUCH_DIRSTAMP)

src/l3dp/node_modules/.dirstamp: src/l3dp/package.json $(L3D_DEPENDENCY) $(CONFIG_DEPENDENCY) $(MTH_COMMONJS_DEPENDENCY)
	@$(call LOG_DEPENDENCIES,l3dp)
	@$(CD) src/l3dp/ && $(NPM_UNINSTALL) config l3d mth && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/l3dp/build/.dirstamp: $(call FIND,src/l3dp/src/,*) src/l3dp/node_modules/.dirstamp src/l3dp/tsconfig-backend.json src/l3dp/backend.config.js src/l3dp/typings
	@$(call LOG_BUILDING,l3dp)
	@$(WEBPACK) --config src/l3dp/backend.config.js
	@$(TOUCH_DIRSTAMP)
	@$(call LOG_BUILT,l3dp)

clean-l3dp:
	@$(RMRF) \
		src/l3dp/build \
		src/l3dp/node_modules \
		src/l3dp/typings/typings \
		src/l3dp/typings/custom \
		src/server/build/static/js/l3dp.js \
		src/server/build/static/js/l3dp.js.map
