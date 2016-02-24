DEMO_DEPENDENCY=src/server/build/static/js/demo.js
demo: $(DEMO_DEPENDENCY)

src/demo/typings/typings/.dirstamp: src/demo/typings/typings.json
	@$(call LOG_TYPINGS,demo)
	@$(CD) src/demo/typings/ && $(TYPINGS) install
	@$(TOUCH_DIRSTAMP)

src/demo/typings/custom/.dirstamp: $(CUSTOM_TYPINGS_SRC)
	@$(call LOG_CUSTOM,demo)
	@$(MKDIRP) src/demo/typings/custom
	@$(MERGE) ./custom_typings src/demo/typings/custom
	@$(TOUCH_DIRSTAMP)

src/demo/typings/.dirstamp: src/demo/typings/typings/.dirstamp src/demo/typings/custom/.dirstamp
	@$(TOUCH_DIRSTAMP)

src/demo/node_modules/.dirstamp: src/demo/package.json $(L3D_DEPENDENCY) $(L3DP_DEPENDENCY)
	@$(call LOG_DEPENDENCIES,demo)
	@$(CD) src/demo/ && $(NPM_UNINSTALL) l3d l3dp && $(NPM_INSTALL)
	@$(TOUCH_DIRSTAMP)

src/server/build/static/js/demo.js: src/demo/main.ts src/demo/node_modules/.dirstamp src/demo/tsconfig.json src/demo/typings/.dirstamp src/demo/config.js src/server/build/static/js/l3d.js src/server/build/static/js/l3dp.js src/server/build/static/js/mth.js
	@$(call LOG_BUILDING,demo)
	@$(NODE) src/demo/config.js
	@$(call LOG_BUILT,demo)

clean-demo:
	@$(RMRF) \
		src/demo/node_modules \
		src/demo/build \
		src/demo/typings/typings \
		src/demo/typings/custom \
		src/server/build/static/js/demo.js \
		src/server/build/static/js/demo.js.map
