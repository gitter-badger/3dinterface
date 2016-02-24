L3D_DEPENDENCY=src/l3d/build/.dirstamp
l3d: $(L3D_DEPENDENCY)

src/l3d/typings: src/l3d/typings/typings/.dirstamp src/l3d/typings/custom/.dirstamp

src/l3d/typings/typings/.dirstamp: src/l3d/typings/typings.json
	@$(call LOG_TYPINGS,l3d)
	@$(CD) src/l3d/typings && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/l3d/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	@$(call LOG_CUSTOM,l3d)
	@$(MKDIRP) src/l3d/typings/custom/
	@$(MERGE) ./custom_typings src/l3d/typings/custom
	@$(TOUCH_DIRSTAMP)

src/l3d/node_modules/.dirstamp: src/l3d/package.json $(MTH_COMMONJS_DEPENDENCY)
	@$(call LOG_DEPENDENCIES,l3d)
	@$(CD) src/l3d/ && $(NPM_UNINSTALL) mth && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/l3d/build/.dirstamp: $(call FIND,src/l3d/src,*) src/l3d/node_modules/.dirstamp src/l3d/tsconfig-backend.json src/l3d/backend.config.js src/l3d/typings/typings/.dirstamp src/l3d/typings/custom/.dirstamp
	@$(call LOG_BUILDING,l3d)
	@$(NODE) src/l3d/backend.config.js
	@$(TOUCH_DIRSTAMP)
	@$(call LOG_BUILT,l3d)

clean-l3d:
	@$(RMRF) \
		src/l3d/build \
		src/l3d/node_modules \
		src/l3d/typings/typings \
		src/l3d/typings/custom \
		src/server/build/static/js/l3d.js \
		src/server/build/static/js/l3d.js.map
