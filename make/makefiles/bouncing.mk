src/bouncing-cube/typings: src/bouncing-cube/typings/typings/.dirstamp src/bouncing-cube/typings/custom/.dirstamp

src/bouncing-cube/typings/typings/.dirstamp: src/bouncing-cube/typings/typings.json
	@$(call LOG_TYPINGS,bouncing-cube)
	@$(CD) src/bouncing-cube/typings && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/bouncing-cube/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	@$(call LOG_CUSTOM,bouncing-cube)
	@$(MKDIRP) src/bouncing-cube/typings/custom/
	@$(MERGE) custom_typings src/bouncing-cube/typings/custom
	@$(TOUCH_DIRSTAMP)

src/bouncing-cube/node_modules/.dirstamp: src/bouncing-cube/package.json $(L3D_DEPENDENCY)
	@$(call LOG_DEPENDENCIES,bouncing-cube)
	@$(CD) src/bouncing-cube/ && $(NPM_UNINSTALL) l3d && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/server/build/static/js/bouncing.min.js: $(call FIND,src/bouncing-cube/src/,*) src/bouncing-cube/node_modules/.dirstamp src/bouncing-cube/tsconfig.json src/bouncing-cube/typings src/bouncing-cube/config.js
	@$(call LOG_BUILDING,bouncing-cube)
	@$(NODE) src/bouncing-cube/config.js
	@$(call LOG_BUILT,bouncing-cube)

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
